const fs = require("fs");
const path = require("path");
const db = require("../models/database.js");
const nodemailer = require("nodemailer");

const getAllOrdersWithItems = (req, res) => {
  const query = `
      SELECT 
          o.order_id, 
          o.user_id, 
          o.total_price AS order_total_price, 
          o.order_status, 
          o.order_date, 
          o.delivery_address, 
          o.payment_status, 
          o.payment_method, 
          o.transaction_date, 
          oi.order_item_id, 
          oi.product_id, 
          oi.quantity, 
          oi.price_at_purchase, 
          oi.total_price AS item_total_price, 
          p.name AS product_name  -- Corrected column name to 'name'
      FROM Orders o
      LEFT JOIN OrderItems oi ON o.order_id = oi.order_id
      LEFT JOIN Products p ON oi.product_id = p.product_id
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      return res
        .status(500)
        .json({
          message: "Failed to fetch orders with items",
          error: err.message,
        });
    }

    const orders = [];
    rows.forEach((row) => {
      const existingOrder = orders.find(
        (order) => order.order_id === row.order_id
      );
      if (existingOrder) {
        existingOrder.items.push({
          order_item_id: row.order_item_id,
          product_id: row.product_id,
          quantity: row.quantity,
          price_at_purchase: row.price_at_purchase,
          total_price: row.item_total_price,
          product_name: row.product_name, // Corrected column name
        });
      } else {
        orders.push({
          order_id: row.order_id,
          user_id: row.user_id,
          total_price: row.order_total_price,
          order_status: row.order_status,
          order_date: row.order_date,
          delivery_address: row.delivery_address,
          payment_status: row.payment_status,
          payment_method: row.payment_method,
          transaction_date: row.transaction_date,
          items: [
            {
              order_item_id: row.order_item_id,
              product_id: row.product_id,
              quantity: row.quantity,
              price_at_purchase: row.price_at_purchase,
              total_price: row.item_total_price,
              product_name: row.product_name, // Corrected column name
            },
          ],
        });
      }
    });

    // Send the response directly
    res.status(200).json({
      message: "Orders and items retrieved successfully",
      orders: orders,
    });
  });
};

const getOrderDetails = (orderId, callback) => {
  const query = `SELECT * FROM Orders WHERE order_id = ?`;

  db.get(query, [orderId], (err, order) => {
    if (err) return callback(err);
    if (!order) return callback(new Error("Order not found."));

    const itemsquery = `SELECT * FROM OrderItems WHERE order_id = ?`;
    db.all(itemsquery, [order.order_id], (err, orderItems) => {
      if (err) return callback(err);
      if (!orderItems || orderItems.length === 0)
        return callback(new Error("Order items not found."));

      callback(null, {
        ...order,
        orderItems,
      });
    });
  });
};

const getAllOrdersByUserId = (userId, callback) => {
  const query = `
  SELECT 
    Orders.order_id,
    Orders.order_status,
    Orders.order_date,
    Orders.payment_status,
    Orders.payment_method,
    Orders.transaction_date,
    OrderItems.product_id,
    OrderItems.quantity,
    OrderItems.price_at_purchase,
    OrderItems.total_price,
    Products.name AS product_name,
    Products.description AS product_description,
    (
      SELECT comment 
      FROM Ratings 
      WHERE product_id = OrderItems.product_id 
      AND user_id = Orders.user_id 
      AND DATE(Ratings.created_at) >= Orders.order_date
      LIMIT 1
    ) AS comment,
    (
      SELECT rating 
      FROM Ratings 
      WHERE product_id = OrderItems.product_id 
      AND user_id = Orders.user_id 
      AND DATE(Ratings.created_at) >= Orders.order_date
      LIMIT 1
    ) AS rating,
    (
      SELECT approved 
      FROM Ratings 
      WHERE product_id = OrderItems.product_id 
      AND user_id = Orders.user_id 
      AND DATE(Ratings.created_at) >= Orders.order_date
      LIMIT 1
    ) AS comment_approved
  FROM Orders
  LEFT JOIN OrderItems ON Orders.order_id = OrderItems.order_id
  LEFT JOIN Products ON OrderItems.product_id = Products.product_id
  WHERE Orders.user_id = ?
`;

  db.all(query, [userId], (err, rows) => {
    if (err) return callback(err);

    // Process the rows to group the order items under each order
    const orders = [];
    rows.forEach((row) => {
      // Check if the order already exists in the orders array
      let order = orders.find((o) => o.order_id === row.order_id);

      if (!order) {
        // If the order is not yet added to the array, create a new order object
        order = {
          order_id: row.order_id,
          order_status: row.order_status,
          order_date: row.order_date,
          payment_status: row.payment_status,
          payment_method: row.payment_method,
          transaction_date: row.transaction_date,
          order_items: [], // Start with an empty array for order items
        };
        orders.push(order);
      }

      // Add the current order item to the order's order_items array
      order.order_items.push({
        product_id: row.product_id,
        quantity: row.quantity,
        price_at_purchase: row.price_at_purchase,
        total_price: row.total_price,
        product_name: row.product_name,
        product_description: row.product_description,
        comment: row.comment,
        rating: row.rating,
        comment_approved: row.comment_approved,
      });
    });

    callback(null, orders); // Return the grouped orders with their items
  });
};

// Update order status function
const updateOrderStatus = (orderId, status, callback) => {
  const validStatuses = ["Processing", "In-Transit", "Delivered"];
  if (!validStatuses.includes(status)) {
    return callback(new Error("Invalid status provided."));
  }

  const updateStatusQuery = `UPDATE Orders SET order_status = ? WHERE order_id = ?`;

  db.run(updateStatusQuery, [status, orderId], (err) => {
    if (err) return callback(err);
    callback(null, `Order status updated to ${status}.`);
  });
};

const cancelOrder = (orderId, callback) => {
  // Ensure that the callback is passed
  if (typeof callback !== "function") {
    throw new Error("Callback function is required.");
  }

  // 1. Retrieve the order details to check its current status
  const getOrderQuery = `SELECT * FROM Orders WHERE order_id = ?`;

  db.get(getOrderQuery, [orderId], (err, order) => {
    if (err) return callback(err);
    if (!order) {
      return callback(new Error("Order not found."));
    }

    // Check if the order is already delivered or returned (can't cancel these)
    if (
      order.order_status === "Delivered" ||
      order.order_status === "Returned"
    ) {
      return callback(
        new Error(
          "Cannot cancel this order as it is already delivered or returned."
        )
      );
    }

    // 2. Update the order status to 'Canceled'
    const cancelOrderQuery = `UPDATE Orders SET order_status = 'Canceled' WHERE order_id = ?`;
    db.run(cancelOrderQuery, [orderId], function (err) {
      if (err) return callback(new Error("Failed to cancel the order."));

      // 3. Restore the stock of the products in this order
      const getOrderItemsQuery = `SELECT * FROM OrderItems WHERE order_id = ?`;
      db.all(getOrderItemsQuery, [orderId], (err, orderItems) => {
        if (err) return callback(new Error("Failed to retrieve order items."));

        orderItems.forEach((item) => {
          // Update the product stock based on the quantity of items in the canceled order
          const updateStockQuery = `UPDATE Products SET quantity_in_stock = quantity_in_stock + ? WHERE product_id = ?`;
          db.run(
            updateStockQuery,
            [item.quantity, item.product_id],
            (stockErr) => {
              if (stockErr) return callback(stockErr);
            }
          );
        });

        // 4. Optionally, handle payment refund (if applicable)
        if (order.payment_status === "Completed") {
          // Example: Handle the refund process (integrate with payment system as needed)
          console.log("Refund process triggered for order:", orderId);
        }

        // 5. Return success callback
        callback(null, {
          message: "Order successfully canceled and stock restored.",
        });
      });
    });
  });
};

const requestItemRefund = (
  orderId,
  orderItemId,
  userId,
  quantity,
  callback
) => {
  if (typeof callback !== "function") {
    throw new Error("Callback function is required.");
  }

  // Step 1: Verify the order and its status
  const getOrderQuery = `SELECT * FROM Orders WHERE order_id = ? AND user_id = ?`;
  db.get(getOrderQuery, [orderId, userId], (err, order) => {
    if (err) return callback(err);
    if (!order) return callback(new Error("Order not found."));

    const orderDate = new Date(order.order_date);
    const currentDate = new Date();
    const differenceInDays = Math.floor(
      (currentDate - orderDate) / (1000 * 60 * 60 * 24)
    );

    if (order.order_status !== "Delivered") {
      return callback(
        new Error("Only delivered orders can be requested for refund.")
      );
    }
    if (differenceInDays > 30) {
      return callback(
        new Error("Return request window has expired (30 days).")
      );
    }

    // Step 2: Check the order item and quantity
    const getOrderItemQuery = `SELECT * FROM OrderItems WHERE order_item_id = ? AND order_id = ?`;
    db.get(getOrderItemQuery, [orderItemId, orderId], (err, item) => {
      if (err) return callback(err);
      if (!item) return callback(new Error("Order item not found."));
      if (quantity > item.quantity || quantity <= 0) {
        return callback(new Error("Invalid quantity requested for refund."));
      }

      // Step 3: Update the `item_status` and `refund_quantity_requested`
      const updateRefundQuery = `
          UPDATE OrderItems
          SET item_status = 'Refund Requested', refund_quantity_requested = ?
          WHERE order_item_id = ?`;

      db.run(updateRefundQuery, [quantity, orderItemId], (err) => {
        if (err) return callback(err);
        callback(null, {
          message: `Refund request submitted for ${quantity} item(s). Awaiting approval.`,
        });
      });
    });
  });
};

const approveItemRefund = (orderItemId, approve, callback) => {
  if (typeof callback !== "function") {
    throw new Error("Callback function is required.");
  }

  // Step 1: Fetch order item details
  const getOrderItemQuery = `
      SELECT oi.*, o.user_id, u.email, u.name, p.name AS product_name 
      FROM OrderItems oi
      JOIN Orders o ON oi.order_id = o.order_id
      JOIN Users u ON o.user_id = u.user_id
      JOIN Products p ON oi.product_id = p.product_id
      WHERE oi.order_item_id = ?`;

  db.get(getOrderItemQuery, [orderItemId], (err, item) => {
    if (err) return callback(err);
    if (!item) return callback(new Error("Order item not found."));

    // Validate refund quantity
    const requestedQuantity = item.refund_quantity_requested || 0;
    if (requestedQuantity <= 0 || requestedQuantity > item.quantity) {
      return callback(new Error("Invalid refund quantity requested."));
    }

    if (!approve) {
      // Reject refund
      const rejectQuery = `
          UPDATE OrderItems 
          SET item_status = 'Normal', refund_quantity_requested = 0 
          WHERE order_item_id = ?`;

      db.run(rejectQuery, [orderItemId], (err) => {
        if (err) return callback(err);

        // Send refund rejection email
        sendRefundRejectionEmail(
          item.email,
          item.name,
          item.product_name,
          (emailErr) => {
            if (emailErr) {
              console.error(
                "Failed to send refund rejection email:",
                emailErr.message
              );
              return callback(emailErr); // Return email error if any
            }
            callback(null, {
              message: "Refund request rejected and user notified.",
            });
          }
        );
      });
    } else {
      // Approve refund
      const approveQuery = `
          UPDATE OrderItems 
          SET item_status = 'Refunded', refund_quantity_requested = 0 
          WHERE order_item_id = ?`;

      db.run(approveQuery, [orderItemId], (err) => {
        if (err) return callback(err);

        // Step 2: Restore stock only for approved quantity
        const updateStockQuery = `
            UPDATE Products 
            SET quantity_in_stock = quantity_in_stock + ? 
            WHERE product_id = ?`;

        db.run(
          updateStockQuery,
          [requestedQuantity, item.product_id],
          (err) => {
            if (err) return callback(err);

            // Step 3: Calculate refund amount based on requested quantity
            const refundAmount = item.price_at_purchase * requestedQuantity;

            console.log(
              `Refund processed for ${requestedQuantity} item(s): $${refundAmount}`
            );

            // Step 4: Send refund approval email
            sendRefundApprovalEmail(
              item.email,
              item.name,
              refundAmount,
              requestedQuantity,
              (emailErr) => {
                if (emailErr) {
                  console.error(
                    "Failed to send refund email:",
                    emailErr.message
                  );
                  return callback(emailErr); // Return email error if any
                }

                callback(null, {
                  message: `Refund approved for ${requestedQuantity} item(s).`,
                  refund_amount: refundAmount,
                });
              }
            );
          }
        );
      });
    }
  });
};

const sendRefundRejectionEmail = (email, name, productName, callback) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "your.coffee2024@gmail.com", // Replace with your email
      pass: "cblx jqda pyqh eddb", // Replace with your app password
    },
  });

  const mailOptions = {
    from: '"Your Coffee" <your.coffee2024@gmail.com>',
    to: email,
    subject: "Refund Request Rejected - Your Coffee",
    text: `
        Dear ${name},
  
        We regret to inform you that your refund request for the product "${productName}" has been rejected.
  
        If you have any questions or require further assistance, please feel free to contact our support team.
  
        Thank you for understanding.
  
        Best Regards,
        Your Coffee Team
      `,
  };

  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Failed to send refund rejection email:", error.message);
      return callback(error);
    }
    console.log("Refund rejection email sent: " + info.response);
    callback(null);
  });
};
// Helper function to send refund approval email
const sendRefundApprovalEmail = (
  email,
  name,
  refundAmount,
  quantity,
  callback
) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "your.coffee2024@gmail.com", // Replace with your email
      pass: "cblx jqda pyqh eddb", // Replace with your app password
    },
  });

  const mailOptions = {
    from: '"Your Coffee" <your.coffee2024@gmail.com>',
    to: email,
    subject: "Refund Approved - Your Coffee",
    text: `
        Dear ${name},
  
        Your refund request for ${quantity} item(s) has been approved. 
  
        Refund Amount: $${refundAmount}
  
        The refund will be processed within 5-7 business days.
  
        Thank you for shopping with us!
  
        Best Regards,
        Your Coffee Team
      `,
  };

  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Failed to send refund email:", error.message);
      return callback(error);
    }
    console.log("Email sent: " + info.response);
    callback(null);
  });
};

const getRefundRequestedOrders = (callback) => {
  const query = `
      SELECT 
        o.order_id,
        o.user_id,
        o.total_price AS order_total_price,
        o.order_status,
        o.order_date,
        o.delivery_address,
        o.payment_status,
        o.payment_method,
        o.transaction_date,
        oi.order_item_id,
        oi.product_id,
        oi.quantity,
        oi.price_at_purchase,
        oi.total_price AS item_total_price,
        oi.refund_quantity_requested,
        p.name AS product_name,
        oi.item_status AS refund_status
      FROM Orders o
      LEFT JOIN OrderItems oi ON o.order_id = oi.order_id
      LEFT JOIN Products p ON oi.product_id = p.product_id
      WHERE oi.item_status = 'Refund Requested'
    `;

  db.all(query, [], (err, rows) => {
    if (err) return callback(err);

    const refundOrders = [];
    rows.forEach((row) => {
      const existingOrder = refundOrders.find(
        (order) => order.order_id === row.order_id
      );
      if (existingOrder) {
        existingOrder.items.push({
          order_item_id: row.order_item_id,
          product_id: row.product_id,
          quantity: row.quantity,
          price_at_purchase: row.price_at_purchase,
          total_price: row.item_total_price,
          refund_quantity_requested: row.refund_quantity_requested,
          product_name: row.product_name,
          refund_status: row.refund_status,
        });
      } else {
        refundOrders.push({
          order_id: row.order_id,
          user_id: row.user_id,
          total_price: row.order_total_price,
          order_status: row.order_status,
          order_date: row.order_date,
          delivery_address: row.delivery_address,
          payment_status: row.payment_status,
          payment_method: row.payment_method,
          transaction_date: row.transaction_date,
          items: [
            {
              order_item_id: row.order_item_id,
              product_id: row.product_id,
              quantity: row.quantity,
              price_at_purchase: row.price_at_purchase,
              total_price: row.item_total_price,
              refund_quantity_requested: row.refund_quantity_requested,
              product_name: row.product_name,
              refund_status: row.refund_status,
            },
          ],
        });
      }
    });

    callback(null, refundOrders);
  });
};

// Retrieve invoices, revenue, and profit in a date range
const getInvoicesInRange = (req, res) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return res
      .status(400)
      .json({ message: "Start and end dates are required" });
  }

  // Query to calculate revenue and fetch order details
  const revenueQuery = `
    SELECT 
        o.order_id, 
        o.total_price AS order_total_price, 
        oi.product_id, 
        oi.quantity, 
        p.cost
    FROM Orders o
    JOIN OrderItems oi ON o.order_id = oi.order_id
    JOIN Products p ON oi.product_id = p.product_id
    WHERE o.order_date BETWEEN ? AND ?
`;

  db.all(
    revenueQuery,
    [`${startDate}T00:00:00.000Z`, `${endDate}T23:59:59.999Z`],
    (err, rows) => {
      if (err) {
        console.error("Error executing query:", err.message);
        return res
          .status(500)
          .json({ message: "Failed to fetch data", error: err.message });
      }

      console.log("Fetched Rows:", rows);

      let totalRevenue = 0;
      let totalCost = 0;

      rows.forEach((row) => {
        totalRevenue += row.order_total_price;
        totalCost += row.cost * row.quantity;
      });

      const profit = totalRevenue - totalCost;

      res.status(200).json({
        message: "Revenue and profit calculated successfully",
        revenue: totalRevenue,
        profit,
      });
    }
  );
};

module.exports = {
  getAllOrdersWithItems,
  getOrderDetails,
  getAllOrdersByUserId,
  updateOrderStatus,
  cancelOrder,
  getInvoicesInRange,
  requestItemRefund,
  approveItemRefund,
  getRefundRequestedOrders,
};
