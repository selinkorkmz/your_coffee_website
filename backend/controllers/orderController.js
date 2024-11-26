const db = require('../models/database.js');

const getOrderDetails = (orderId, callback) => {
    const query = `SELECT * FROM Orders WHERE order_id = ?`;

    db.get(query, [orderId], (err, order) => {
        if (err) return callback(err);
        if (!order) return callback(new Error('Order not found.'));
        callback(null, order);
    });
};

const getAllOrdersByUserId = (userId, callback) => {
    const query = `
        SELECT 
            Orders.order_id, 
            Orders.product_id, 
            Orders.quantity, 
            Orders.price_at_purchase, 
            Orders.total_price, 
            Orders.order_status, 
            Orders.order_date, 
            Orders.payment_status, 
            Orders.payment_method, 
            Orders.transaction_date,
            Products.name AS product_name,
            Products.description AS product_description
        FROM Orders
        LEFT JOIN Products ON Orders.product_id = Products.product_id
        WHERE Orders.user_id = ?
    `;

    db.all(query, [userId], (err, rows) => {
        if (err) return callback(err);
        callback(null, rows);
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

const handlePaymentConfirmation = (orderId, userEmail, callback) => {
    const updatePaymentStatusQuery = `UPDATE Orders SET payment_status = 'Completed' WHERE order_id = ?`;

    db.run(updatePaymentStatusQuery, [orderId], (err) => {
        if (err) return callback(err);

        // Retrieve order details for further actions
        getOrderDetails(orderId, (err, orderDetails) => {
            if (err) return callback(err);

            // Example: Send email invoice (dummy implementation)
            sendInvoiceEmail(userEmail, orderDetails, callback);
        });
    });
};

const cancelOrder = (orderId, userId, callback) => {
    const getOrderQuery = `SELECT user_id, order_status, product_id, quantity FROM Orders WHERE order_id = ?`;

    db.get(getOrderQuery, [orderId], (err, order) => {
        if (err) return callback(err);
        if (!order) return callback(new Error('Order not found.'));
        if (order.user_id !== userId) return callback(new Error('Unauthorized to cancel this order.'));
        if (order.order_status !== 'Processing') {
            return callback(new Error('Order cannot be canceled as it has already shipped.'));
        }

        const updateStockQuery = `UPDATE Products SET quantity_in_stock = quantity_in_stock + ? WHERE product_id = ?`;
        db.run(updateStockQuery, [order.quantity, order.product_id], (updateErr) => {
            if (updateErr) return callback(updateErr);

            const cancelOrderQuery = `UPDATE Orders SET order_status = 'Canceled' WHERE order_id = ?`;
            db.run(cancelOrderQuery, [orderId], (cancelErr) => {
                if (cancelErr) return callback(cancelErr);
                callback(null, 'Order canceled successfully and stock updated.');
            });
        });
    });
};

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

        const updateStockQuery = `UPDATE Products SET quantity_in_stock = quantity_in_stock + ? WHERE product_id = ?`;
        db.run(updateStockQuery, [order.quantity, order.product_id], (updateErr) => {
            if (updateErr) return callback(updateErr);

            const returnOrderQuery = `UPDATE Orders SET order_status = 'Returned' WHERE order_id = ?`;
            db.run(returnOrderQuery, [orderId], (returnErr) => {
                if (returnErr) return callback(returnErr);
                callback(null, `Order ${orderId} returned successfully and stock updated.`);
            });
        });
    });
};

module.exports = { getOrderDetails, getAllOrdersByUserId, updateOrderStatus, handlePaymentConfirmation, cancelOrder, processReturn };
