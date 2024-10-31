const express = require('express');
const router = express.Router();
const { updateUser, registerUser, signInUser, getAllUsers, getUserByEmail } = require('../controllers/authController.js');
const authenticateJWT = require('../middlewares/authMiddleware'); // Middleware to verify JWT

// Route to register a user
router.post('/register', (req, res) => {
    const { name, email, password, role } = req.body;

    registerUser(name, email, password, role, (err, result) => {
        if (err) {
            return res.status(400).json({ message: err.message });
        }
        res.status(201).json({ message: 'User registered successfully', userId: result.userId });
    });
});

// Route to sign in a user
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    // Call the signInUser function
    signInUser(email, password, (err, data) => {
        if (err) {
            return res.status(400).json({ message: err.message });
        }
        // Send back the JWT token and user information
        res.status(200).json({ message: 'User signed in successfully', token: data.token, user: data.user });
    });
});

// Route to get all users (Protected Route)
router.get('/getallusers', authenticateJWT, (req, res) => {
    getAllUsers((err, users) => {
        if (err) {
            return res.status(500).json({ message: 'Failed to retrieve users' });
        }
        res.status(200).json({ message: 'Users retrieved successfully', users });
    });
});

// Route to get a user by email (Protected Route)
router.get('/users/email/:email', authenticateJWT, (req, res) => {
    const email = req.params.email;

    getUserByEmail(email, (err, user) => {
        if (err) {
            return res.status(404).json({ message: err.message });
        }
        res.status(200).json({ message: 'User retrieved successfully', user });
    });
});

// Route to update user information (Protected Route)
router.put('/users/:id', authenticateJWT, (req, res) => {
    const userId = req.params.id;
    const { name, email, password } = req.body;

    updateUser(userId, name, email, password, (err, message) => {
        if (err) {
            return res.status(400).json({ message: err.message });
        }
        res.status(200).json({ message });
    });
});

module.exports = router;
