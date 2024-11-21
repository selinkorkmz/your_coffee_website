// middlewares/authorizeRole.js

// middlewares/authorizeRole.js

const authorizeRole = (allowedRoles) => {
    return (req, res, next) => {
        const userRole = req.user.role; // Extract user role from the JWT payload

        if (allowedRoles.includes(userRole)) {
            req.isAuthorizedRole = true; // Set a flag if the user has an authorized role
        } else {
            return res.status(403).json({ message: 'Forbidden: You do not have the required permissions.' });
        }
        next(); // Allow all users to proceed regardless of role
    };
};

module.exports = authorizeRole;
