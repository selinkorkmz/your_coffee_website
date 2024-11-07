// routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const authenticateJWT = require('../middlewares/authMiddleware');
const authorizeRole = require('../middlewares/authorizeRole');
const { createOrder, getOrderDetails, updateOrderStatus, handlePaymentConfirmation, cancelOrder, processReturn } = require('../controllers/orderController.js');

router.post('/create', authenticateJWT, (req, res) => {
    const { userId, productId, quantity, deliveryAddress } = req.body;
    createOrder(userId, productId, quantity, deliveryAddress, (err, result) => {
        if (err) return res.status(400).json({ message: err.message });
        res.status(201).json({ message: 'Order created successfully', orderId: result.orderId });
    });
});


// Route to retrieve order details (for generating invoice)
router.get('/details/:orderId', (req, res) => {
    const orderId = req.params.orderId;

    getOrderDetails(orderId, (err, order) => {
        if (err) return res.status(500).json({ message: 'Failed to retrieve order details', error: err.message });
        res.status(200).json({ message: 'Order details retrieved successfully', order });
    });
});


// Route to update order status (restricted to Product Managers only)
router.put('/status/:orderId', authenticateJWT, authorizeRole(['Product Manager']), (req, res) => {
    const { status } = req.body;
    updateOrderStatus(req.params.orderId, status, (err, message) => {
        if (err) return res.status(400).json({ message: err.message });
        res.status(200).json({ message });
    });
});

// Route to confirm payment and send invoice
router.post('/confirmPayment/:orderId', (req, res) => {
    const userEmail = req.body.userEmail;
    handlePaymentConfirmation(req.params.orderId, userEmail, (err, message) => {
        if (err) return res.status(400).json({ message: err.message });
        res.status(200).json({ message });
    });
});

// Route to cancel an order (restricted to the order owner)
router.post('/cancel/:orderId', authenticateJWT, (req, res) => {
    const userId = req.user.userId; // Get the authenticated user ID from the JWT
    cancelOrder(req.params.orderId, userId, (err, message) => {
        if (err) return res.status(400).json({ message: err.message });
        res.status(200).json({ message });
    });
});

// Route to process a return
router.post('/return/:orderId', (req, res) => {
    processReturn(req.params.orderId, (err, message) => {
        if (err) return res.status(400).json({ message: err.message });
        res.status(200).json({ message });
    });
});

module.exports = router;
