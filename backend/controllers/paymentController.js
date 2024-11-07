// controllers/paymentController.js
const db = require('../models/database.js');

const initiateOrderPayment = (orderId, paymentMethod, callback) => {
    const transactionDate = new Date().toISOString();
    const paymentStatus = 'Pending';

    const updateOrderPaymentQuery = `
        UPDATE Orders
        SET payment_status = ?, payment_method = ?, transaction_date = ?
        WHERE order_id = ?
    `;
    
    db.run(updateOrderPaymentQuery, [paymentStatus, paymentMethod, transactionDate, orderId], (err) => {
        if (err) return callback(err);
        callback(null, 'Payment initiated successfully.');
    });
};

const confirmOrderPayment = (orderId, callback) => {
    const updateOrderStatusQuery = `
        UPDATE Orders
        SET payment_status = 'Completed'
        WHERE order_id = ?
    `;
    
    db.run(updateOrderStatusQuery, [orderId], (err) => {
        if (err) return callback(err);
        callback(null, 'Payment confirmed successfully.');
    });
};

const getOrderPaymentStatus = (orderId, callback) => {
    const query = `SELECT payment_status FROM Orders WHERE order_id = ?`;
    
    db.get(query, [orderId], (err, row) => {
        if (err) return callback(err);
        callback(null, row ? row.payment_status : 'Order not found');
    });
};

module.exports = { initiateOrderPayment, confirmOrderPayment, getOrderPaymentStatus };
