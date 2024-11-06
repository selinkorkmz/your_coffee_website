// middlewares/authorizeRole.js

// middlewares/authorizeRole.js

const authorizeRole = (allowedRoles) => {
    return (req, res, next) => {
        const userRole = req.user.role; // Extract user role from the JWT payload

        if (allowedRoles.includes(userRole)) {
            req.isAuthorizedRole = true; // Set a flag if the user has an authorized role
        } else {
            req.isAuthorizedRole = false; // Set a flag if user role doesn't match
        }
        next(); // Allow all users to proceed regardless of role
    };
};

module.exports = authorizeRole;




module.exports = authorizeRole;
