const express = require('express');
const router = express.Router();
const { addToCart,getShoppingCart } = require('../controllers/cartController.js');

// Route to add a product to the user's cart
router.post('/users/:userId/addProductToCart', (req, res) => {
    const userId = req.params.userId;
    const { productId, quantity } = req.body;

    addToCart(userId, productId, quantity, (err, message) => {
        if (err) {
            return res.status(400).json({ message: err.message });
        }
        res.status(200).json({ message });
    });
});
// Route to get the shopping cart of a specific user
router.get('/users/:userId/cart', (req, res) => {
    const userId = req.params.userId;

    getShoppingCart(userId, (err, cart) => {
        if (err) {
            return res.status(400).json({ message: err.message });
        }
        res.status(200).json({ message: 'Shopping cart retrieved successfully', cart });
    });
});
module.exports = router;
