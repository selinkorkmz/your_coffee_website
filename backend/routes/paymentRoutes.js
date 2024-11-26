const express = require('express');
const router = express.Router();
const authenticateJWT = require('../middlewares/authMiddleware');
const {
    pay,
    getOrderPaymentStatus
} = require('../controllers/paymentController.js');

// Route to initiate payment
router.post('/pay', authenticateJWT, (req, res) => {
    const userId = req.user.userId;
    const { cardDetails, deliveryAddress } = req.body;

    pay(userId, cardDetails, deliveryAddress, (err, result) => {
        if (err) return res.status(400).json({ message: err.message });
        res.status(201).json(result);
    });
});


// Route to check payment status
router.get('/status/:orderId', authenticateJWT, (req, res) => {
    const orderId = req.params.orderId;

    getOrderPaymentStatus(orderId, (err, status) => {
        if (err) return res.status(500).json({ message: 'Failed to retrieve payment status', error: err.message });
        res.status(200).json({ message: 'Payment status retrieved successfully', status });
    });
});

module.exports = router;
