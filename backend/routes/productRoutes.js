const express = require('express');
const router = express.Router();
const {
    getProductById,
    getAllProducts,
    getProductByField,
    //getCoffeeByProductId,
    addProduct,
    setDiscountOnProduct,
    getAllCategories,
    searchProducts,
    updateProduct,
    deleteProduct
} = require('../controllers/productController.js');  // Import the functions from the controller

const authenticateJWT = require('../middlewares/authMiddleware.js'); // JWT authentication middleware
const authorizeRole = require('../middlewares/authorizeRole.js'); // Role-based authorization middleware

// Route to get all products (Accessible by all roles, including customers)
router.get('/all', (req, res) => {
    getAllProducts((err, products) => {
        if (err) {
            return res.status(500).json({ message: 'Failed to retrieve products', error: err.message });
        }
        res.status(200).json({ message: 'Products retrieved successfully', products });
    });
});

// Route to get a product by its product_id (Accessible by all roles, including customers)
router.get('/getbyid/:id', (req, res) => {
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
/*router.get('/coffees/product/:id', (req, res) => {
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
});*/

// Route to add a product (Only for Product Managers and Admins)
router.post('/', authenticateJWT, authorizeRole(['Product Manager', 'Admin']), (req, res) => {
    addProduct(req.body, (err, productId) => {
        if (err) {
            return res.status(500).json({ message: 'Failed to add product', error: err.message });
        }
        res.status(201).json({ message: 'Product added successfully', productId });
    });
});


//updateproduct function ı controllerda yok?
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

router.get('/categories', (req, res) => {
    getAllCategories((err, categories) => {
        if (err) {
            return res.status(500).json({ message: 'Failed to retrieve categories' });
        }
        res.status(200).json({ message: 'Categories retrieved successfully', categories });
    });
});


router.get('/search', (req, res) => {
    const searchTerm = req.query.q; // Get the search term from query parameter

    if (!searchTerm) {
        return res.status(400).json({ message: 'Search term is required' });
    }

    searchProducts(searchTerm, (err, products) => {
        if (err) {
            return res.status(500).json({ message: 'Failed to search products' });
        }
        res.status(200).json({ message: 'Products retrieved successfully', products });
    });
});

// Route to set a discount on a product (Only for Sales Managers and Admins)
router.put('/:id/discount', (req, res) => {
    const productId = req.params.id;
    const { discountRate } = req.body;

    // Validate the discount rate input
    if (discountRate === undefined || discountRate <= 0 || discountRate >= 1) {
        return res.status(400).json({ message: 'Invalid or missing discount rate' });
    }

    // Apply the discount using the controller function
    setDiscountOnProduct(productId, discountRate, (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Failed to apply discount', error: err.message });
        }
        res.status(200).json({ message: 'Discount applied successfully', product: result });
    });
});
module.exports = router;
