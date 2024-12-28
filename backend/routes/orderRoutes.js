const express = require('express');
const router = express.Router();
const authenticateJWT = require('../middlewares/authMiddleware');
const authorizeRole = require('../middlewares/authorizeRole');
const {
    getOrderDetails,
    getAllOrdersByUserId,
    updateOrderStatus,
    cancelOrder,
    getInvoicesInRange,
    requestItemRefund,
    approveItemRefund,
    getRefundRequestedOrders
} = require('../controllers/orderController');

const ordersController = require('../controllers/orderController');

router.get('/allOrders', ordersController.getAllOrdersWithItems);

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


  // Get invoices within date range
// Get invoices within a date range (Sales Managers only)
router.get('/invoices', getInvoicesInRange);

// Route to request refund for a specific quantity of an item
router.put("/:orderId/items/:itemId/refund", authenticateJWT, (req, res) => {
  const { orderId, itemId } = req.params;
  const { quantity } = req.body;
  const { userId } = req.user; // Extract user ID from JWT token

  requestItemRefund(orderId, itemId, userId, quantity, (err, result) => {
      if (err) {
          return res.status(400).json({ message: err.message });
      }
      res.status(200).json(result);
  });
});
// Route to approve or reject a refund request for a specific order item
router.put(
  '/items/:itemId/approve-refund', 
  authenticateJWT, 
  authorizeRole(['Sales Manager']), // Only Product Managers can approve/reject refunds
  (req, res) => {
      const { approve } = req.body; // Approve or reject status
      const { itemId } = req.params; // Order Item ID

      // Call the controller function
      approveItemRefund(itemId, approve, (err, result) => {
          if (err) {
              return res.status(400).json({ message: err.message }); // Handle errors
          }
          res.status(200).json(result); // Send success response
      });
  }
);

// Route to get all refund requested orders (accessible by Sales Manager only)
router.get('/refund-requests', authenticateJWT, authorizeRole(['Sales Manager']), (req, res) => {
  getRefundRequestedOrders((err, refundOrders) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to retrieve refund requested orders', error: err.message });
    }

    res.status(200).json({
      message: 'Refund requested orders retrieved successfully',
      refundOrders,
    });
  });
});
module.exports = router;
