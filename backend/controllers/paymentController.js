const db = require('../models/database.js');

// Initiate payment for an order
const initiateCartPayment = (userId, paymentMethod, callback) => {
    const getCartQuery = `SELECT * FROM ShoppingCart WHERE user_id = ?`;

    db.all(getCartQuery, [userId], (err, cartItems) => {
        if (err) return callback(err);
        if (!cartItems || cartItems.length === 0) return callback(new Error('Cart is empty.'));

        const orderDate = new Date().toISOString();
        const transactionDate = orderDate; // Use the same timestamp for now
        const paymentStatus = 'Pending';

        const createOrderQuery = `
            INSERT INTO Orders (user_id, product_id, quantity, price_at_purchase, total_price, order_status, order_date, payment_status, payment_method, transaction_date)
            VALUES (?, ?, ?, ?, ?, 'Processing', ?, ?, ?, ?)
        `;

        let errorOccurred = false;

        cartItems.forEach((item, index) => {
            const priceAtPurchase = item.discounted_price !== null ? item.discounted_price : item.price;
            const totalPrice = priceAtPurchase * item.quantity;

            db.run(createOrderQuery, [userId, item.product_id, item.quantity, priceAtPurchase, totalPrice, orderDate, paymentStatus, paymentMethod, transactionDate], function (err) {
                if (err) {
                    errorOccurred = true;
                    console.error('Error inserting order:', err.message);
                }

                // After all items are processed, return the result or an error
                if (index === cartItems.length - 1) {
                    if (errorOccurred) {
                        callback(new Error('Failed to initiate payment for one or more items.'));
                    } else {
                        callback(null, { message: 'Payment initiated successfully.', orderId: this.lastID });
                    }
                }
            });
        });
    });
};



// Confirm payment for an order
const confirmCartPayment = (userId, orderId, callback) => {
    const updatePaymentQuery = `
        UPDATE Orders
        SET payment_status = 'Completed', order_status = 'Processing'
        WHERE order_id = ? AND user_id = ? AND payment_status = 'Pending'
    `;

    db.run(updatePaymentQuery, [orderId, userId], (err) => {
        if (err) return callback(err);

        // Clear the cart after payment confirmation
        const clearCartQuery = `DELETE FROM ShoppingCart WHERE user_id = ?`;
        db.run(clearCartQuery, [userId], (clearErr) => {
            if (clearErr) return callback(clearErr);
            callback(null, { message: 'Payment confirmed and cart cleared.' });
        });
    });
};


// Retrieve payment status for an order
const getOrderPaymentStatus = (orderId, callback) => {
    const query = `SELECT payment_status FROM Orders WHERE order_id = ?`;

    db.get(query, [orderId], (err, row) => {
        if (err) return callback(err);
        callback(null, row ? row.payment_status : 'Order not found.');
    });
};

module.exports = { initiateCartPayment, confirmCartPayment, getOrderPaymentStatus };
