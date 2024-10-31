const express = require('express');
const router = express.Router();
const {
    getProductById,
    getAllProducts,
    getProductByField,
    getCoffeeByProductId,
    addProduct,
    updateProduct,
    deleteProduct
} = require('../controllers/productController.js');  // Import the functions from the controller

const authenticateJWT = require('../middlewares/authMiddleware'); // JWT authentication middleware
const authorizeRole = require('../middlewares/authorizeRole'); // Role-based authorization middleware

// Route to get all products (Accessible by all roles, including customers)
router.get('/', (req, res) => {
    getAllProducts((err, products) => {
        if (err) {
            return res.status(500).json({ message: 'Failed to retrieve products', error: err.message });
        }
        res.status(200).json({ message: 'Products retrieved successfully', products });
    });
});

// Route to get a product by its product_id (Accessible by all roles, including customers)
router.get('/:id', (req, res) => {
    const productId = req.params.id;

    getProductById(productId, (err, product) => {
        if (err) {
            return res.status(500).json({ message: 'Failed to retrieve product', error: err.message });
        }
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json({ message: 'Product retrieved successfully', product });
    });
});

// Route to get product by a specific field (e.g., name or category) (Accessible by all roles, including customers)
router.get('/field/:field/:value', (req, res) => {
    const field = req.params.field; // Field to search by (e.g., name, category)
    const value = req.params.value; // Value of the field

    getProductByField(field, value, (err, product) => {
        if (err) {
            return res.status(500).json({ message: `Failed to retrieve product by ${field}`, error: err.message });
        }
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json({ message: `Product by ${field} retrieved successfully`, product });
    });
});

// Route to get coffee by product_id (Accessible by all roles, including customers)
router.get('/coffees/product/:id', (req, res) => {
    const productId = req.params.id;

    getCoffeeByProductId(productId, (err, coffee) => {
        if (err) {
            return res.status(500).json({ message: 'Failed to retrieve coffee', error: err.message });
        }
        if (!coffee) {
            return res.status(404).json({ message: 'Coffee not found' });
        }
        res.status(200).json({ message: 'Coffee retrieved successfully', coffee });
    });
});

// Route to add a product (Only for Product Managers and Admins)
router.post('/', authenticateJWT, authorizeRole(['Product Manager', 'Admin']), (req, res) => {
    addProduct(req.body, (err, productId) => {
        if (err) {
            return res.status(500).json({ message: 'Failed to add product', error: err.message });
        }
        res.status(201).json({ message: 'Product added successfully', productId });
    });
});

// Route to update a product (Only for Product Managers and Admins)
router.put('/:id', authenticateJWT, authorizeRole(['Product Manager', 'Admin']), (req, res) => {
    const productId = req.params.id;
    const { name, description, price, quantity_in_stock, warranty_status, distributor_info, category } = req.body;
    updateProduct(productId, name, description, price, quantity_in_stock, warranty_status, distributor_info, category, (err) => {
        if (err) {
            return res.status(500).json({ message: 'Failed to update product', error: err.message });
        }
        res.status(200).json({ message: 'Product updated successfully' });
    });
});

// Route to delete a product (Only for Product Managers and Admins)
router.delete('/:id', authenticateJWT, authorizeRole(['Product Manager', 'Admin']), (req, res) => {
    const productId = req.params.id;
    deleteProduct(productId, (err) => {
        if (err) {
            return res.status(500).json({ message: 'Failed to delete product', error: err.message });
        }
        res.status(200).json({ message: 'Product deleted successfully' });
    });
});

module.exports = router;
