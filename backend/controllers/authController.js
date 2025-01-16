// controllers/authController.js

const db = require('../models/database.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { use } = require('../routes/orderRoutes.js');

// JWT Secret Key (should be stored securely in environment variables)
const JWT_SECRET = 'your-secret-key';

// Function to register a new user
const registerUser = async (name, email, password, role,tax_id,home_address, callback) => {
    // Check if the email is already in use
    const checkEmailQuery = `SELECT * FROM Users WHERE email = ?`;

    db.get(checkEmailQuery, [email], async (err, row) => {
        if (err) {
            return callback(err);
        }
        if (row) {
            return callback(new Error('Email already in use. Please use a different email.'));
        }

        // Hash the password using bcrypt
        const hashedPassword = await bcrypt.hash(password, 10);
        const shoppingCart = JSON.stringify([]); // Initialize an empty shopping cart

        // Insert the new user
        const insertUserQuery = `
            INSERT INTO Users (name, email, password, role, shopping_cart, tax_id, home_address)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        db.run(insertUserQuery, [name, email, hashedPassword, role, shoppingCart, tax_id, home_address], function (err) {
            if (err) {
                return callback(err);
            }
            callback(null, { userId: this.lastID });
        });
    });
};

// Function to sign in a user
const signInUser = (email, password, callback) => {
    // Query to find the user by email
    const query = `SELECT * FROM Users WHERE email = ?`;

    db.get(query, [email], async (err, user) => {
        if (err) {
            return callback(err);
        }
        if (!user) {
            return callback(new Error('Invalid email or password.'));
        }

        // Compare the hashed password using bcrypt
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return callback(new Error('Invalid email or password.'));
        }

        // Generate a JWT token
        const token = jwt.sign({ userId: user.user_id, role: user.role }, JWT_SECRET, { expiresIn: '888888h' });

        // Return user and token
        callback(null, { token, user });
    });
};

// Get All Users Function
const getAllUsers = (callback) => {
    const query = `SELECT user_id, name, email, role, shopping_cart, tax_id, home_address FROM Users`; // Exclude sensitive data like passwords

    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Error fetching users:', err.message);
            return callback(err);
        }
        callback(null, rows);
    });
};

// Get User by Email Function
const getUserByEmail = (email, callback) => {
    const query = `SELECT user_id, name, email, role FROM Users WHERE email = ?`; // Exclude password for security

    db.get(query, [email], (err, row) => {
        if (err) {
            console.error('Error fetching user by email:', err.message);
            return callback(err);
        }
        if (!row) {
            return callback(new Error('User not found'));
        }
        callback(null, row); // Return user details
    });
};

// Update User Information Function
const updateUser = async (userId, name, email, password, tax_id, home_address, callback) => {
    // Check if the new email is already in use by another user
    const checkEmailQuery = `SELECT * FROM Users WHERE email = ? AND user_id != ?`;

    db.get(checkEmailQuery, [email, userId], async (err, row) => {
        if (err) return callback(err);
        if (row) return callback(new Error('Email already in use by another user.'));

        // Prepare the query and parameters based on whether the password is provided
        const hashedPassword = password ? await bcrypt.hash(password, 10) : null;
        let updateQuery = `UPDATE Users SET name = ?, email = ?, tax_id = ?, home_address = ?`;
        const params = [name, email, tax_id, home_address];

        // Add password to query and parameters if provided
        if (hashedPassword) {
            updateQuery += `, password = ?`;
            params.push(hashedPassword);
        }

        updateQuery += ` WHERE user_id = ?`;
        params.push(userId);

        // Execute the update query
        db.run(updateQuery, params, function (err) {
            if (err) return callback(err);
            callback(null, 'User information updated successfully.');
        });
    });
};

// Update Home Address and Tax ID
const updateUserAddressandTaxid = (user_id, home_address, tax_id, callback) => {
    // SQL query to update the fields
    const query = `
        UPDATE Users
        SET home_address = ?, tax_id = ?
        WHERE user_id = ?
    `;

    db.run(query, [home_address, tax_id, user_id], function (err) {
        if (err) {
            console.error("Error updating user details:", err.message);
            return callback(err); // Return error if query fails
        }

        // Check if any row was affected
        if (this.changes === 0) {
            return callback(new Error("User not found or no changes made.")); // No matching user or no update
        }

        callback(null, { message: "User details updated successfully." }); // Success
    });
};

// Function to get detailed user information by user_id
const getUserProfile = (userId, callback) => {
    const query =` SELECT user_id, name, email, role, shopping_cart, tax_id, home_address FROM Users WHERE user_id = ? `;

    db.get(query, [userId], (err, row) => {
        if (err) {
            console.error('Error fetching user profile:', err.message);
            callback(err, null);
        } else {
            callback(null, row); // Return the user's profile data
        }
    });
};

// Export the functions
module.exports = {
    registerUser,
    signInUser,
    getAllUsers,
    getUserByEmail,
    updateUser,
    getUserProfile,
    updateUserAddressandTaxid
};
