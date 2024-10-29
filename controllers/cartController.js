const db = require('../models/database.js');

// Function to add a product to the user's shopping cart
const addToCart = (userId, productId, quantity, callback) => {
    // Step 1: Check if there is enough stock
    const stockCheckQuery = `SELECT quantity_in_stock FROM Products WHERE product_id = ?`;

    db.get(stockCheckQuery, [productId], (err, product) => {
        if (err) return callback(err);
        if (!product) return callback(new Error('Product not found.'));
        if (product.quantity_in_stock < quantity) return callback(new Error('Insufficient stock.'));

        // Step 2: Retrieve the user's shopping cart
        const getCartQuery = `SELECT shopping_cart FROM Users WHERE user_id = ?`;

        db.get(getCartQuery, [userId], (err, user) => {
            if (err) return callback(err);
            if (!user) return callback(new Error('User not found.'));

            // Parse the shopping_cart JSON data
            let cart = JSON.parse(user.shopping_cart || '[]');

            // Step 3: Check if the product is already in the cart
            const cartItemIndex = cart.findIndex(item => item.product_id === productId);

            if (cartItemIndex > -1) {
                // Product already in cart, update the quantity
                cart[cartItemIndex].quantity += quantity;
            } else {
                // Product not in cart, add a new entry
                cart.push({ product_id: productId, quantity });
            }

            // Step 4: Update the shopping cart in the database
            const updateCartQuery = `UPDATE Users SET shopping_cart = ? WHERE user_id = ?`;
            db.run(updateCartQuery, [JSON.stringify(cart), userId], (err) => {
                if (err) return callback(err);

                // Step 5: Decrease the product's stock in the Products table
                const stockUpdateQuery = `UPDATE Products SET quantity_in_stock = quantity_in_stock - ? WHERE product_id = ?`;

                db.run(stockUpdateQuery, [quantity, productId], (err) => {
                    if (err) return callback(err);
                    callback(null, 'Product added to cart successfully.');
                });
            });
        });
    });
};
// Function to get the shopping cart of a specific user
const getShoppingCart = (userId, callback) => {
    const query = `SELECT shopping_cart FROM Users WHERE user_id = ?`;

    db.get(query, [userId], (err, user) => {
        if (err) {
            console.error('Error fetching shopping cart:', err.message);
            return callback(err, null);
        }
        if (!user) {
            return callback(new Error('User not found'), null);
        }

        // Parse the shopping_cart JSON data
        const cart = JSON.parse(user.shopping_cart || '[]');
        callback(null, cart);
    });
};

module.exports = { addToCart,getShoppingCart };
