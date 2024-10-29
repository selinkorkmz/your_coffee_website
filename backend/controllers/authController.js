const db = require('../models/database.js');
const md5 = require('md5');

// Function to register a new user
const registerUser = (name, email, password, role, callback) => {
    // Check if the email is already in use
    const checkEmailQuery = `SELECT * FROM Users WHERE email = ?`;

    db.get(checkEmailQuery, [email], (err, row) => {
        if (err) {
            return callback(err);
        }
        if (row) {
            return callback(new Error('Email already in use. Please use a different email.'));
        }

        // Insert the new user
        const insertUserQuery = `
            INSERT INTO Users (name, email, password, role, shopping_cart)
            VALUES (?, ?, ?, ?, ?)
        `;
        const hashedPassword = md5(password); // Hash the password using md5
        const shoppingCart = JSON.stringify([]); // Initialize an empty shopping cart

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
    const hashedPassword = md5(password); // Hash the entered password

    // Query to find the user by email and password
    const query = `SELECT * FROM Users WHERE email = ? AND password = ?`;

    db.get(query, [email, hashedPassword], (err, row) => {
        if (err) {
            return callback(err);
        }
        if (!row) {
            return callback(new Error('Invalid email or password'));
        }

        // If user is found, return user data
        callback(null, row);
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
const updateUser = (userId, name, email, password, callback) => {
    // Check if the new email is already in use by another user
    const checkEmailQuery = `SELECT * FROM Users WHERE email = ? AND user_id != ?`;

    db.get(checkEmailQuery, [email, userId], (err, row) => {
        if (err) return callback(err);
        if (row) return callback(new Error('Email already in use by another user.'));

        // Prepare the query and parameters based on whether the password is provided
        const hashedPassword = password ? md5(password) : null;
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



module.exports = { registerUser, signInUser, getAllUsers,getUserByEmail,updateUser };