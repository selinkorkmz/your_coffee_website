// controllers/orderController.js
const db = require('../models/database.js');

const createOrder = (userId, productId, quantity, deliveryAddress, callback) => {
    // Step 1: Check stock availability and get price details
    const stockAndPriceQuery = `SELECT quantity_in_stock, price, discounted_price FROM Products WHERE product_id = ?`;

    db.get(stockAndPriceQuery, [productId], (err, product) => {
        if (err) return callback(err);
        if (!product || product.quantity_in_stock < quantity) {
            return callback(new Error('Insufficient stock available.'));
        }

        // Determine the price at the time of purchase
        const priceAtPurchase = product.discounted_price !== null ? product.discounted_price : product.price;

        // Step 2: Proceed with order creation if stock is sufficient
        const orderDate = new Date().toISOString();
        const total_price = priceAtPurchase * quantity;
        const orderStatus = 'Processing';
        const paymentStatus = 'Pending';

        const insertOrderQuery = `
            INSERT INTO Orders (user_id, product_id, quantity, price_at_purchase, total_price, order_status, order_date, delivery_address, payment_status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        db.run(insertOrderQuery, [userId, productId, quantity, priceAtPurchase, total_price, orderStatus, orderDate, deliveryAddress, paymentStatus], function (err) {
            if (err) return callback(err);
            const orderId = this.lastID;

            // Step 3: Decrease stock in Products table
            const updateStockQuery = `UPDATE Products SET quantity_in_stock = quantity_in_stock - ? WHERE product_id = ?`;
            db.run(updateStockQuery, [quantity, productId], (updateErr) => {
                if (updateErr) return callback(updateErr);
                callback(null, { orderId });
            });
        });
    });
};


const getOrderDetails = (orderId, callback) => {
    const query = `SELECT * FROM Orders WHERE order_id = ?`;

    db.get(query, [orderId], (err, order) => {
        if (err) return callback(err);
        if (!order) return callback(new Error('Order not found.'));
        callback(null, order);
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
//const { generateInvoicePDF, sendInvoiceEmail } = require('./invoiceController'); // Assumes these functions are defined

const handlePaymentConfirmation = (orderId, userEmail, callback) => {
    const updatePaymentStatusQuery = `UPDATE Orders SET payment_status = 'Completed' WHERE order_id = ?`;

    db.run(updatePaymentStatusQuery, [orderId], (err) => {
        if (err) return callback(err);

        // Retrieve order details for invoice generation
        getOrderDetails(orderId, (err, orderDetails) => {
            if (err) return callback(err);

            // Generate and email the invoice PDF
            generateInvoicePDF(orderDetails, (pdfErr, pdfData) => {
                if (pdfErr) return callback(pdfErr);
                sendInvoiceEmail(userEmail, pdfData, callback);
            });
        });
    });
};


// Cancel an order if not yet shipped
const cancelOrder = (orderId, userId, callback) => {
    const getOrderQuery = `SELECT user_id, order_status, product_id, quantity FROM Orders WHERE order_id = ?`;

    db.get(getOrderQuery, [orderId], (err, order) => {
        if (err) return callback(err);
        if (!order) return callback(new Error('Order not found.'));
        if (order.user_id !== userId) return callback(new Error('Unauthorized to cancel this order.'));
        if (order.order_status !== 'Processing') {
            return callback(new Error('Order cannot be canceled as it has already shipped.'));
        }

        // Update stock if order is cancelable
        const updateStockQuery = `UPDATE Products SET quantity_in_stock = quantity_in_stock + ? WHERE product_id = ?`;
        db.run(updateStockQuery, [order.quantity, order.product_id], (updateErr) => {
            if (updateErr) return callback(updateErr);

            // Update order status to "Canceled"
            const cancelOrderQuery = `UPDATE Orders SET order_status = 'Canceled' WHERE order_id = ?`;
            db.run(cancelOrderQuery, [orderId], (cancelErr) => {
                if (cancelErr) return callback(cancelErr);
                callback(null, 'Order canceled successfully and stock updated.');
            });
        });
    });
};


// Return a product within 30 days for a refund
const processReturn = (orderId, callback) => {
    const getOrderQuery = `
        SELECT order_id, product_id, quantity, price_at_purchase, order_date, order_status
        FROM Orders
        WHERE order_id = ?
    `;

    db.get(getOrderQuery, [orderId], (err, order) => {
        if (err) return callback(err);
        if (!order) return callback(new Error('Order not found.'));
        if (order.order_status !== 'Delivered') {
            return callback(new Error('Only delivered orders can be returned.'));
        }

        const orderDate = new Date(order.order_date);
        const today = new Date();
        const daysSinceOrder = Math.floor((today - orderDate) / (1000 * 60 * 60 * 24));

        if (daysSinceOrder > 30) {
            return callback(new Error('Return period has expired.'));
        }

        // Update stock after return
        const updateStockQuery = `UPDATE Products SET quantity_in_stock = quantity_in_stock + ? WHERE product_id = ?`;
        db.run(updateStockQuery, [order.quantity, order.product_id], (updateErr) => {
            if (updateErr) return callback(updateErr);

            // Update order status to "Returned" and refund the customer
            const returnOrderQuery = `UPDATE Orders SET order_status = 'Returned' WHERE order_id = ?`;
            db.run(returnOrderQuery, [orderId], (returnErr) => {
                if (returnErr) return callback(returnErr);
                callback(null, `Order ${orderId} returned successfully and stock updated.`);
            });
        });
    });
};

module.exports = {createOrder, getOrderDetails, updateOrderStatus, cancelOrder, handlePaymentConfirmation, processReturn};

