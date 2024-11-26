// controllers/authController.js

const db = require('../models/database.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// JWT Secret Key (should be stored securely in environment variables)
const JWT_SECRET = 'your-secret-key';

// Function to register a new user
const registerUser = async (name, email, password, role, callback) => {
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
            INSERT INTO Users (name, email, password, role, shopping_cart)
            VALUES (?, ?, ?, ?, ?)
        `;

        db.run(insertUserQuery, [name, email, hashedPassword, role, shoppingCart], function (err) {
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
    const query = `SELECT user_id, name, email, role, shopping_cart FROM Users`; // Exclude sensitive data like passwords

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
const updateUser = async (userId, name, email, password, callback) => {
    // Check if the new email is already in use by another user
    const checkEmailQuery = `SELECT * FROM Users WHERE email = ? AND user_id != ?`;

    db.get(checkEmailQuery, [email, userId], async (err, row) => {
        if (err) return callback(err);
        if (row) return callback(new Error('Email already in use by another user.'));

        // Prepare the query and parameters based on whether the password is provided
        const hashedPassword = password ? await bcrypt.hash(password, 10) : null;
        let updateQuery = `UPDATE Users SET name = ?, email = ?`;
        const params = [name, email];

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

// Function to get detailed user information by user_id
const getUserProfile = (userId, callback) => {
    const query =` SELECT user_id, name, email, role, shopping_cart FROM Users WHERE user_id = ? `;

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
    getUserProfile
};
