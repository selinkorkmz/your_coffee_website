// middlewares/authorizeRole.js

const authorizeRole = (allowedRoles) => {
    return (req, res, next) => {
        const userRole = req.user.role; // Extract user role from the JWT payload

        if (allowedRoles.includes(userRole)) {
            next(); // Proceed if user has the correct role
        } else {
            res.status(403).json({ message: 'Forbidden: You do not have the required permissions.' });
        }
    };
};

module.exports = authorizeRole;
