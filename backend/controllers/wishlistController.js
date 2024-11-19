const db = require('../models/database.js');

const addToWishlist = (userId, productId, callback) => {
    // Step 1: Check if the product exists in the Products table
    const productCheckQuery = `SELECT * FROM Products WHERE product_id = ?`;

    db.get(productCheckQuery, [productId], (err, product) => {
        if (err) return callback(err);
        if (!product) return callback(new Error('Product not found.'));

        // Step 2: Check if the product is already in the wishlist
        const wishlistCheckQuery = `SELECT * FROM Wishlist WHERE user_id = ? AND product_id = ?`;

        db.get(wishlistCheckQuery, [userId, productId], (err, wishlistItem) => {
            if (err) return callback(err);

            if (wishlistItem) {
                // Product is already in the wishlist
                return callback(null, 'Product is already in the wishlist.');
            } else {
                // Step 3: Insert the product into the wishlist
                const insertWishlistQuery = `
                    INSERT INTO Wishlist 
                    (user_id, product_id, name, description, model, serial_number, price, discounted_price, quantity_in_stock, warranty_status, distributor_info, origin, roast_level, power_usage, category) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `;

                db.run(insertWishlistQuery, [
                    userId, product.product_id,
                    product.name, product.description, product.model, product.serial_number,
                    product.price, product.discounted_price, product.quantity_in_stock, product.warranty_status,
                    product.distributor_info, product.origin, product.roast_level,
                    product.power_usage, product.category
                ], (insertErr) => {
                    if (insertErr) return callback(insertErr);
                    callback(null, 'Product added to the wishlist.');
                });
            }
        });
    });
};

const removeFromWishlist = (userId, productId, callback) => {
    const deleteWishlistQuery = `DELETE FROM Wishlist WHERE user_id = ? AND product_id = ?`;

    db.run(deleteWishlistQuery, [userId, productId], (err) => {
        if (err) return callback(err);
        callback(null, 'Product removed from the wishlist.');
    });
};

const getWishlist = (userId, callback) => {
    const query = `
        SELECT 
            product_id,
            name,
            description,
            model,
            serial_number,
            price,
            discounted_price,
            quantity_in_stock,
            warranty_status,
            distributor_info,
            origin,
            roast_level,
            power_usage,
            category,
            added_at
        FROM Wishlist
        WHERE user_id = ?
    `;

    db.all(query, [userId], (err, rows) => {
        if (err) {
            console.error('Error fetching wishlist:', err.message);
            return callback(err, null);
        }
        if (rows.length === 0) {
            return callback(null, []);
        }

        // Return detailed wishlist information
        callback(null, rows);
    });
};


module.exports = { addToWishlist, removeFromWishlist, getWishlist, };
