const express = require('express');
const router = express.Router();
const { updateUserAddressandTaxid, updateUser, registerUser, signInUser, getAllUsers, getUserByEmail,getUserProfile } = require('../controllers/authController.js');
const authenticateJWT = require('../middlewares/authMiddleware.js'); // Middleware to verify JWT

// Route to register a user
router.post('/register', (req, res) => {
    const { name, email, password, role, tax_id, home_address } = req.body;

    registerUser(name, email, password, role, tax_id, home_address, (err, result) => {
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

// Route to get detailed user information by user_id
router.get('/users/profile/:id', (req, res) => {
    const userId = req.params.id;

    getUserProfile(userId, (err, user) => {
        if (err) {
            return res.status(500).json({ message: 'Failed to retrieve user profile' });
        }
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'User profile retrieved successfully', user });
    });
});

// Route to update home address and tax ID
router.put('/:id/updateaddress', authenticateJWT, (req, res) => {
    const userId = req.params.id;
    const { home_address, tax_id } = req.body;

    // Input validation
    if (!home_address || !tax_id) {
        return res.status(400).json({ message: "Home address and tax ID are required." });
    }

    // Call the controller function
    updateUserAddressandTaxid(userId, home_address, tax_id, (err, result) => {
        if (err) {
            return res.status(500).json({ message: err.message });
        }
        res.status(200).json(result);
    });
});

module.exports = router;
