const express = require('express');
const router = express.Router();
const { addToWishlist, removeFromWishlist, getWishlist } = require('../controllers/wishlistController.js');
const authenticateJWT = require('../middlewares/authMiddleware.js'); // JWT authentication middleware
const authorizeRole = require('../middlewares/authorizeRole.js'); // Role-based authorization middleware

// Route to add a product to the user's wishlist (Only for customers)
router.post('/:userId/addProductToWishlist', authenticateJWT, authorizeRole(['Customer']), (req, res) => {
    const userId = req.params.userId;
    const { productId } = req.body;

    addToWishlist(userId, productId, (err, message) => {
        if (err) {
            return res.status(400).json({ message: err.message });
        }
        res.status(200).json({ message });
    });
});

// Route to remove a product from the user's wishlist (Only for customers)
router.post('/:userId/removeProductFromWishlist', authenticateJWT, authorizeRole(['Customer']), (req, res) => {
    const userId = req.params.userId;
    const { productId } = req.body;

    removeFromWishlist(userId, productId, (err, message) => {
        if (err) {
            return res.status(400).json({ message: err.message });
        }
        res.status(200).json({ message });
    });
});

// Route to get the wishlist of a specific user (Only for customers)
router.get('/:userId', authenticateJWT, authorizeRole(['Customer']), (req, res) => {
    const userId = req.params.userId;

    getWishlist(userId, (err, wishlist) => {
        if (err) {
            return res.status(500).json({
                message: 'Failed to retrieve wishlist',
                error: err.message,
            });
        }

        // Return an empty array for an empty wishlist
        if (!wishlist || wishlist.length === 0) {
            return res.status(200).json({
                message: 'Wishlist is empty',
                wishlist: [], // Return an empty array for consistency
            });
        }

        res.status(200).json({
            message: 'Wishlist retrieved successfully',
            wishlist,
        });
    });
});


module.exports = router;
