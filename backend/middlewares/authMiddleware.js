// authMiddleware.js

const jwt = require("jsonwebtoken");
const JWT_SECRET = "your-secret-key";

const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];

    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ message: "Invalid or expired token." });
      }

      req.user = user; // Attach user data (including role) to the request
      next();
    });
  } else {
    res.status(401).json({ message: "Authorization token is missing." });
  }
};

module.exports = authenticateJWT;
