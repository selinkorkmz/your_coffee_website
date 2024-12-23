const fs = require('fs');
const path = require('path');
const db = require('../models/database.js');

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
          return res.status(500).json({ message: 'Failed to fetch orders with items', error: err.message });
      }

      const orders = [];
      rows.forEach(row => {
          const existingOrder = orders.find(order => order.order_id === row.order_id);
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
                  items: [{
                      order_item_id: row.order_item_id,
                      product_id: row.product_id,
                      quantity: row.quantity,
                      price_at_purchase: row.price_at_purchase,
                      total_price: row.item_total_price,
                      product_name: row.product_name, // Corrected column name
                  }],
              });
          }
      });

      // Send the response directly
      res.status(200).json({
          message: 'Orders and items retrieved successfully',
          orders: orders
      });
  });
};

const getOrderDetails = (orderId, callback) => {
    const query = `SELECT * FROM Orders WHERE order_id = ?`;

    db.get(query, [orderId], (err, order) => {
        if (err) return callback(err);
        if (!order) return callback(new Error('Order not found.'));


        const itemsquery = `SELECT * FROM OrderItems WHERE order_id = ?`;
        db.all(itemsquery, [order.order_id], (err, orderItems) => {
            if (err) return callback(err);
            if (!orderItems  || orderItems.length === 0) return callback(new Error('Order items not found.'));

            callback(null, {
                ...order,
                orderItems
            });
        })

        
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
        Ratings.comment AS comment,
        Ratings.rating AS rating,
        Ratings.approved AS comment_approved
      FROM Orders
      LEFT JOIN OrderItems ON Orders.order_id = OrderItems.order_id
      LEFT JOIN Products ON OrderItems.product_id = Products.product_id
      LEFT JOIN Ratings ON OrderItems.product_id = Ratings.product_id AND Orders.user_id = Ratings.user_id
      WHERE Orders.user_id = ?
    `;
  
    db.all(query, [userId], (err, rows) => {
      if (err) return callback(err);
  
      // Process the rows to group the order items under each order
      const orders = [];
      rows.forEach(row => {
        // Check if the order already exists in the orders array
        let order = orders.find(o => o.order_id === row.order_id);
        
        if (!order) {
          // If the order is not yet added to the array, create a new order object
          order = {
            order_id: row.order_id,
            order_status: row.order_status,
            order_date: row.order_date,
            payment_status: row.payment_status,
            payment_method: row.payment_method,
            transaction_date: row.transaction_date,
            order_items: [] // Start with an empty array for order items
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
          comment_approved: row.comment_approved
        });
      });
  
      callback(null, orders); // Return the grouped orders with their items
    });
  };
  
  

// Update order status function
const updateOrderStatus = (orderId, status, callback) => {
    const validStatuses = ['Processing', 'In-Transit', 'Delivered'];
    if (!validStatuses.includes(status)) {
        return callback(new Error('Invalid status provided.'));
    }

    const updateStatusQuery = `UPDATE Orders SET order_status = ? WHERE order_id = ?`;

    db.run(updateStatusQuery, [status, orderId], (err) => {
        if (err) return callback(err);
        callback(null, `Order status updated to ${status}.`);
    });
};


const cancelOrder = (orderId, callback) => {
    // Ensure that the callback is passed
    if (typeof callback !== 'function') {
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
      if (order.order_status === "Delivered" || order.order_status === "Returned") {
        return callback(new Error("Cannot cancel this order as it is already delivered or returned."));
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
            db.run(updateStockQuery, [item.quantity, item.product_id], (stockErr) => {
              if (stockErr) return callback(stockErr);
            });
          });
  
          // 4. Optionally, handle payment refund (if applicable)
          if (order.payment_status === "Completed") {
            // Example: Handle the refund process (integrate with payment system as needed)
            console.log("Refund process triggered for order:", orderId);
          }
  
          // 5. Return success callback
          callback(null, { message: "Order successfully canceled and stock restored." });
        });
      });
    });
  };
  
  
const processReturn = (orderId, callback) => {
    // Ensure callback is passed
    if (typeof callback !== 'function') {
      throw new Error("Callback function is required.");
    }
  
    // 1. Check if the order exists and can be returned
    const getOrderQuery = `SELECT * FROM Orders WHERE order_id = ?`;
    db.get(getOrderQuery, [orderId], (err, order) => {
      if (err) return callback(err);
      if (!order) {
        return callback(new Error("Order not found."));
      }
  
      // 2. Check if the order is eligible for return (must be 'Delivered' or 'In-Transit')
      if (order.order_status !== 'Delivered' && order.order_status !== 'In-Transit') {
        return callback(new Error("This order cannot be returned because it is not delivered or in-transit."));
      }
  
      // 3. Update the order status to 'Returned'
      const updateOrderStatusQuery = `UPDATE Orders SET order_status = 'Returned' WHERE order_id = ?`;
      db.run(updateOrderStatusQuery, [orderId], function (err) {
        if (err) return callback(new Error("Failed to update order status to 'Returned'."));
  
        // 4. Fetch order items to restore stock
        const getOrderItemsQuery = `SELECT * FROM OrderItems WHERE order_id = ?`;
        db.all(getOrderItemsQuery, [orderId], (err, orderItems) => {
          if (err) return callback(new Error("Failed to retrieve order items."));
  
          orderItems.forEach((item) => {
            // Restore stock for each returned item
            const updateStockQuery = `UPDATE Products SET quantity_in_stock = quantity_in_stock + ? WHERE product_id = ?`;
            db.run(updateStockQuery, [item.quantity, item.product_id], (stockErr) => {
              if (stockErr) return callback(stockErr);
            });
          });
  
          // 5. Optionally handle refund logic (for completed payments)
          if (order.payment_status === "Completed") {
            console.log("Refund process triggered for order:", orderId);
            // Implement refund logic here (example: refund via payment gateway)
          }
  
          // Return success message
          callback(null, { message: "Return processed successfully. Stock restored." });
        });
      });
    });
  };


  // Retrieve invoices, revenue, and profit in a date range
  const getInvoicesInRange = (req, res) => {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
        return res.status(400).json({ message: 'Start and end dates are required' });
    }

    const invoiceQuery = `
        SELECT * 
        FROM Invoices 
        WHERE strftime('%Y-%m-%d', invoice_date) BETWEEN ? AND ?
    `;

    console.log('Query:', invoiceQuery);
    console.log('Parameters:', [startDate, endDate]);

    db.all(invoiceQuery, [startDate, endDate], (err, rows) => {
        if (err) {
            console.error('Error executing query:', err.message);
            return res.status(500).json({ message: 'Failed to fetch invoices', error: err.message });
        }

        console.log('Query Result:', rows);

        let revenue = 0, profit = 0;

        rows.forEach(invoice => {
            revenue += invoice.total_price;
            profit += invoice.total_price * 0.25;
        });

        res.status(200).json({
            message: 'Invoices retrieved successfully',
            invoices: rows,
            revenue,
            profit,
        });
    });
};

module.exports = { getAllOrdersWithItems, getOrderDetails, getAllOrdersByUserId, updateOrderStatus, cancelOrder, processReturn, getInvoicesInRange };
