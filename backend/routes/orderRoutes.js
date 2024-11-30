const express = require('express');
const router = express.Router();
const authenticateJWT = require('../middlewares/authMiddleware');
const authorizeRole = require('../middlewares/authorizeRole');
const {
    getOrderDetails,
    getAllOrdersByUserId,
    updateOrderStatus,
    cancelOrder,
    processReturn
} = require('../controllers/orderController');



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
  
    // Ensure the user is requesting only their own orders
    if (userId !== req.user.userId.toString()) {
      return res.status(403).json({ message: 'Unauthorized access to orders.' });
    }
  
    // Call the function to get orders by userId
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

router.post('/cancel', authenticateJWT, (req, res) => {
    const { orderId } = req.body;
  
    // Cancel the order by orderId
    cancelOrder(orderId, (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      return res.status(200).json({ message: result.message });
    });
  });

// Route to process a return
router.post('/return', authenticateJWT, (req, res) => {
    const { orderId } = req.body;  // Order ID to return
  
    // Call the processReturn function
    processReturn(orderId, (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      return res.status(200).json({ message: result.message });
    });
  });

module.exports = router;
