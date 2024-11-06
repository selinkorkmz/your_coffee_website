const db = require('../models/database.js');

// Function to add a product to the user's shopping cart
const addToCart = (userId, productId, quantity, callback) => {
    // Step 1: Check if there is enough stock in the Products table
    const stockCheckQuery = `SELECT * FROM Products WHERE product_id = ?`;

    db.get(stockCheckQuery, [productId], (err, product) => {
        if (err) return callback(err);
        if (!product) return callback(new Error('Product not found.'));
        if (product.quantity_in_stock < quantity) return callback(new Error('Insufficient stock.'));

        // Proceed with adding or updating the cart
        addOrUpdateCart(userId, product, quantity, callback);
    });
};

// Helper function to add or update cart entry
const addOrUpdateCart = (userId, product, quantity, callback) => {
    // Check if the product is already in the user's shopping cart
    const cartCheckQuery = `SELECT quantity FROM ShoppingCart WHERE user_id = ? AND product_id = ?`;

    db.get(cartCheckQuery, [userId, product.product_id], (err, cartItem) => {
        if (err) return callback(err);

        if (cartItem) {
            // Product already in cart, update quantity
            const newQuantity = cartItem.quantity + quantity;
            const updateCartQuery = `UPDATE ShoppingCart SET quantity = ? WHERE user_id = ? AND product_id = ?`;

            db.run(updateCartQuery, [newQuantity, userId, product.product_id], (updateErr) => {
                if (updateErr) return callback(updateErr);
                decreaseStock(product.product_id, quantity, callback);
            });
        } else {
            // Product not in cart, insert new entry with all details
            const insertCartQuery = `
                INSERT INTO ShoppingCart 
                (user_id, product_id, quantity, name, description, model, serial_number, price, quantity_in_stock, warranty_status, distributor_info, origin, roast_level, power_usage, category) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            db.run(insertCartQuery, [
                userId, product.product_id, quantity,
                product.name, product.description, product.model, product.serial_number,
                product.price, product.quantity_in_stock, product.warranty_status,
                product.distributor_info, product.origin, product.roast_level,
                product.power_usage, product.category
            ], (insertErr) => {
                if (insertErr) return callback(insertErr);
                decreaseStock(product.product_id, quantity, callback);
            });
        }
    });
};

// Helper function to decrease product stock
const decreaseStock = (productId, quantity, callback) => {
    const stockUpdateQuery = `UPDATE Products SET quantity_in_stock = quantity_in_stock - ? WHERE product_id = ?`;

    db.run(stockUpdateQuery, [quantity, productId], (err) => {
        if (err) return callback(err);
        callback(null, 'Product added to cart successfully.');
    });
};

// Function to get the shopping cart of a specific user, including product details
const getShoppingCart = (userId, callback) => {
    const query = `
        SELECT 
            product_id,
            quantity,
            name,
            description,
            model,
            serial_number,
            price,
            warranty_status,
            distributor_info,
            origin,
            roast_level,
            power_usage,
            category
        FROM ShoppingCart
        WHERE user_id = ?
    `;

    db.all(query, [userId], (err, rows) => {
        if (err) {
            console.error('Error fetching shopping cart:', err.message);
            return callback(err, null);
        }
        if (rows.length === 0) {
            return callback(null, []);
        }

        // Return detailed cart information
        callback(null, rows);
    });
};

module.exports = { addToCart, getShoppingCart };
