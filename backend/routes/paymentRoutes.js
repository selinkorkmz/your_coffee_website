// routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const { initiateOrderPayment, confirmOrderPayment, getOrderPaymentStatus } = require('../controllers/paymentController.js');

// Route to initiate order payment
router.post('/initiate', (req, res) => {
    const { orderId, paymentMethod } = req.body;

    initiateOrderPayment(orderId, paymentMethod, (err, message) => {
        if (err) return res.status(500).json({ message: 'Failed to initiate payment', error: err.message });
        res.status(201).json({ message });
    });
});

// Route to confirm order payment (simulating banking confirmation)
router.put('/confirm/:orderId', (req, res) => {
    const orderId = req.params.orderId;

    confirmOrderPayment(orderId, (err, message) => {
        if (err) return res.status(500).json({ message: 'Failed to confirm payment', error: err.message });
        res.status(200).json({ message });
    });
});

// Route to check order payment status
router.get('/status/:orderId', (req, res) => {
    const orderId = req.params.orderId;

    getOrderPaymentStatus(orderId, (err, status) => {
        if (err) return res.status(500).json({ message: 'Failed to retrieve payment status', error: err.message });
        res.status(200).json({ message: 'Payment status retrieved', status });
    });
});

module.exports = router;
