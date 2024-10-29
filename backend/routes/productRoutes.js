const express = require('express');
const router = express.Router();
const { getProductById,getAllProducts,getProductByField,getCoffeeByProductId } = require('../controllers/productController.js');  // Import the function from the controller

// Route to get a product by its product_id
router.get('/products/:id', (req, res) => {
    const productId = req.params.id;

    getProductById(productId, (err, product) => {
        if (err) {
            return res.status(500).json({ message: 'Failed to retrieve product' });
        }
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json({ message: 'Product retrieved successfully', product });
    });
});


// Route to get all products
router.get('/products', (req, res) => {
    getAllProducts((err, products) => {
        if (err) {
            return res.status(500).json({ message: 'Failed to retrieve products' });
        }
        res.status(200).json({ message: 'Products retrieved successfully', products });
    });
});


// Route to get product by a specific field (e.g., name or category)
router.get('/products/field/:field/:value', (req, res) => {
    const field = req.params.field; // Field to search by (e.g., name, category)
    const value = req.params.value; // Value of the field

    getProductByField(field, value, (err, product) => {
        if (err) {
            return res.status(500).json({ message: `Failed to retrieve product by ${field}` });
        }
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json({ message: `Product by ${field} retrieved successfully`, product });
    });
});


// Route to get coffee by product_id
router.get('/coffees/product/:id', (req, res) => {
    const productId = req.params.id;

    getCoffeeByProductId(productId, (err, coffee) => {
        if (err) {
            return res.status(500).json({ message: 'Failed to retrieve coffee' });
        }
        if (!coffee) {
            return res.status(404).json({ message: 'Coffee not found' });
        }
        res.status(200).json({ message: 'Coffee retrieved successfully', coffee });
    });
});

module.exports = router;