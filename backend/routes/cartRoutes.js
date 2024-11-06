const express = require('express');
const router = express.Router();
const { addToCart, getShoppingCart,removeFromCart } = require('../controllers/cartController.js');
const authenticateJWT = require('../middlewares/authMiddleware.js'); // JWT authentication middleware
const authorizeRole = require('../middlewares/authorizeRole.js'); // Role-based authorization middleware
//authenticateJWT, authorizeRole(['Customer']),
// Route to add a product to the user's cart (Only for customers)
router.post('/:userId/addProductToCart',authenticateJWT, authorizeRole(['Customer']), (req, res) => {
    const userId = req.params.userId;
    const { productId, quantity } = req.body;

    addToCart(userId, productId, quantity, (err, message) => {
        if (err) {
            return res.status(400).json({ message: err.message });
        }
        res.status(200).json({ message });
    });
});

// Route to remove a product from the user's cart 
router.post('/:userId/removeProductFromCart', authenticateJWT, authorizeRole(['Customer']), (req, res) => {
    const userId = req.params.userId;
    const { productId, quantity } = req.body;

    removeFromCart(userId, productId, quantity, (err, message) => {
        if (err) {
            return res.status(400).json({ message: err.message });
        }
        res.status(200).json({ message });
    });
});

// Route to get the shopping cart of a specific user (Only for customers)
//authenticateJWT, authorizeRole(['Customer']),
router.get('/:userId',authenticateJWT, authorizeRole(['Customer']),  (req, res) => {
    const userId = req.params.userId;

    getShoppingCart(userId, (err, cart) => {
        if (err) {
            return res.status(500).json({ message: 'Failed to retrieve shopping cart', error: err.message });
        }
        if (!cart) {
            return res.status(404).json({ message: 'Shopping cart not found' });
        }
        res.status(200).json({ message: 'Shopping cart retrieved successfully', cart });
    });
});

module.exports = router;
