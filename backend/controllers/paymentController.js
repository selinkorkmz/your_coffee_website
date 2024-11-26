const db = require("../models/database.js");
const nodemailer = require("nodemailer");
const { generateInvoicePDF } = require("../utils/invoiceGenerator"); // Utility to generate PDF
const PDFDocument = require("pdfkit");
const fs = require("fs");

// Create a reusable transporter object using SMTP transport.
const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "c61aa51a188d7f",
    pass: "948b14d12fa27c",
  },
});

// Utility to send email
const sendInvoiceEmail = (userId, pdfPath, callback) => {
  const getUserQuery = `SELECT email FROM Users WHERE user_id = ?`;
  console.log("mailatmak üzereyim");

  db.get(getUserQuery, [userId], (err, user) => {
    if (err || !user) {
      console.log("hatam var", err, user);
      return callback(err || new Error("User not found."));
    }
    const mailOptions = {
      from: "yourcoffee@yourcoffee.com",
      to: user.email,
      subject: "Your Invoice",
      text: "Thank you for your purchase. Please find your invoice attached.",
      attachments: [
        {
          filename: "invoice.pdf",
          path: pdfPath,
        },
      ],
    };

    console.log("maili atıyorum");

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("error var");
        return callback(error);
      }
      callback(null);
    });
  });
};

const pay = (userId, cardDetails, deliveryAddress, callback) => {
  const getCartQuery = `SELECT * FROM ShoppingCart WHERE user_id = ?`;

  db.all(getCartQuery, [userId], (err, cartItems) => {
    if (err) return callback(err);
    if (!cartItems || cartItems.length === 0)
      return callback(new Error("Cart is empty."));

    if (
      !/^\d{16}$/.test(cardDetails.cardNumber) ||
      !/^\d{3}$/.test(cardDetails.cvv)
    ) {
      return callback(new Error("Invalid card details."));
    }

    const orderDate = new Date().toISOString();
    const paymentStatus = "Completed";
    const paymentMethod = "Credit Card";
    const createOrderQuery = `
            INSERT INTO Orders (user_id, total_price, order_status, order_date, payment_status, delivery_address, payment_method, transaction_date)
            VALUES (?, ?, 'Processing', ?, ?, ?, ?, ?)
        `;
    let totalOrderPrice = 0;

    // Calculate the total price for the entire cart
    cartItems.forEach((item) => {
      const priceAtPurchase =
        item.discounted_price !== null ? item.discounted_price : item.price;
      const totalPrice = priceAtPurchase * item.quantity;
      totalOrderPrice += totalPrice;
    });

    let orderId = 0;

    db.run(
      createOrderQuery,
      [
        userId,
        totalOrderPrice,
        orderDate,
        paymentStatus,
        paymentMethod,
        deliveryAddress,
        orderDate,
      ],
      function (err) {
        if (err) return callback(new Error("Payment processing failed."));
        console.log(this);
        orderId = this.lastID;

        const createOrderItemQuery = `
            INSERT INTO OrderItems (product_id, order_id, quantity, price_at_purchase, total_price)
            VALUES (?, ?, ?, ?,?)
        `;
        let errorOccurred = false;

        cartItems.forEach((item) => {
          const priceAtPurchase = item.discounted_price || item.price;
          const totalPrice = priceAtPurchase * item.quantity;

          db.run(
            createOrderItemQuery,
            [
              item.product_id,
              orderId,
              item.quantity,
              priceAtPurchase,
              totalPrice,
            ],
            function (err) {
              console.log("orderitem oluşturuyorum");
              if (err) {
                errorOccurred = true;
                console.log("errrrr", err);
              }
            }
          );

          // Decrease stock
          const updateStockQuery = `UPDATE Products SET quantity_in_stock = quantity_in_stock - ? WHERE product_id = ?`;
          db.run(
            updateStockQuery,
            [item.quantity, item.product_id],
            (stockErr) => {
              if (stockErr) return callback(stockErr);
            }
          );



          if (errorOccurred) {
            return callback(new Error("Payment processing failed."));
          }
        });

        generateInvoicePDF(
            userId,
            totalOrderPrice,
            cartItems,
            (pdfErr, pdfPath) => {
              if (pdfErr) {
                return callback(pdfErr);
              }
              sendInvoiceEmail(userId, pdfPath, (emailErr) => {
                if (emailErr) return callback(emailErr);
                console.log("Payment successful and invoice emailed.");
              });
            }
          );
      
          // Clear the cart after payment confirmation
          const clearCartQuery = `DELETE FROM ShoppingCart WHERE user_id = ?`;
          db.run(clearCartQuery, [userId], (clearErr) => {
            if (clearErr) return callback(clearErr);
            callback(null, {
              message: "Payment confirmed, order created and cart cleared.",
            });
          });
      }
    );

    
  });
};

// Retrieve payment status for an order
const getOrderPaymentStatus = (orderId, callback) => {
  const query = `SELECT payment_status FROM Orders WHERE order_id = ?`;

  db.get(query, [orderId], (err, row) => {
    if (err) return callback(err);
    callback(null, row ? row.payment_status : "Order not found.");
  });
};

module.exports = { sendInvoiceEmail, getOrderPaymentStatus, pay };
