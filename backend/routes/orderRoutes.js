const express = require('express');
const router = express.Router();
const authenticateJWT = require('../middlewares/authMiddleware');
const authorizeRole = require('../middlewares/authorizeRole');
const {
    confirmPaymentAndCreateOrder,
    getOrderDetails,
    getAllOrdersByUserId,
    updateOrderStatus,
    cancelOrder,
    processReturn
} = require('../controllers/orderController');

// Route to confirm payment and create an order from cart items
router.post('/confirm', authenticateJWT, (req, res) => {
    const userId = req.user.userId; // Extract user ID from JWT
    const { paymentId } = req.body;

    confirmPaymentAndCreateOrder(userId, paymentId, (err, result) => {
        if (err) return res.status(400).json({ message: err.message });
        res.status(201).json(result);
    });
});

// Route to retrieve order details
router.get('/details/:orderId', authenticateJWT, (req, res) => {
    const orderId = req.params.orderId;

    getOrderDetails(orderId, (err, order) => {
        if (err) return res.status(500).json({ message: 'Failed to retrieve order details', error: err.message });
        res.status(200).json({ message: 'Order details retrieved successfully', order });
    });
});

router.get('/user/:userId', authenticateJWT, (req, res) => {
    const userId = req.params.userId;

    // Ensure only the authenticated user can access their orders
    if (userId !== req.user.userId.toString()) {
        return res.status(403).json({ message: 'Unauthorized access to orders.' });   
        
    }

    getAllOrdersByUserId(userId, (err, orders) => {
        if (err) return res.status(500).json({ message: 'Failed to retrieve orders.', error: err.message });
        res.status(200).json({ message: 'Orders retrieved successfully.', orders });
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

// Route to cancel an order (restricted to the order owner)
router.post('/cancel/:orderId', authenticateJWT, (req, res) => {
    const userId = req.user.userId; // Extract user ID from JWT
    const orderId = req.params.orderId;

    cancelOrder(orderId, userId, (err, message) => {
        if (err) return res.status(400).json({ message: err.message });
        res.status(200).json({ message });
    });
});

// Route to process a return
router.post('/return/:orderId', authenticateJWT, (req, res) => {
    const orderId = req.params.orderId;

    processReturn(orderId, (err, message) => {
        if (err) return res.status(400).json({ message: err.message });
        res.status(200).json({ message });
    });
});

module.exports = router;
