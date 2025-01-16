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
            p.*,
            w.added_at
        FROM Wishlist w
        left join Products p on p.product_id = w.product_id
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
const nodemailer = require('nodemailer');

/**
 * Alert users when a product in their wishlist is discounted.
 * @param {number} productId - The product ID that has been discounted.
 * @param {number} newPrice - The new discounted price.
 * @param {function} callback - Callback function for success or error.
 */
const alertUserWishlist = (productId, newPrice, callback) => {
    // Step 1: Fetch user emails for users with the product in their wishlist
    const getUserEmailsQuery = `
        SELECT DISTINCT u.email, u.name
        FROM Wishlist w
        JOIN Users u ON w.user_id = u.user_id
        WHERE w.product_id = ?
    `;

    db.all(getUserEmailsQuery, [productId], (err, users) => {
        if (err) {
            console.error('Error retrieving user emails:', err.message);
            return callback(new Error('Error retrieving user emails.'));
        }

        if (!users || users.length === 0) {
            console.log('No users found with this product in their wishlist.');
            return callback(null, 'No users to alert.');
        }

        // Step 2: Create a transporter for sending emails
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'your.coffee2024@gmail.com', // Replace with your email
                pass: 'cblx jqda pyqh eddb', // Replace with your email app password
            },
        });

        // Step 3: Prepare email options and send emails
        const emailPromises = users.map((user) => {
            const mailOptions = {
                from: '"Your Coffee" <your.coffee2024@gmail.com>', // Sender address
                to: user.email, // Recipient email
                subject: 'Product Discount Alert', // Email subject
                text: `Hello ${user.name},\n\nGood news! A product in your wishlist is now discounted. 
                       The new price is $${newPrice}.\n\nVisit our website to grab the deal before it’s gone!\n\nBest regards,\nYour Coffee Team`, // Email body
            };

            return transporter.sendMail(mailOptions);
        });

        // Step 4: Handle email sending results
        Promise.all(emailPromises)
            .then(() => {
                console.log('All emails sent successfully.');
                callback(null, 'Users alerted successfully.');
            })
            .catch((error) => {
                console.error('Error sending emails:', error.message);
                callback(new Error('Failed to send some emails.'));
            });
    });
};

module.exports = {
    addToWishlist,
    removeFromWishlist,
    getWishlist,
    alertUserWishlist,
};

