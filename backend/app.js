const express = require("express");
const app = express();
const cors = require("cors");
const PORT = process.env.PORT || 3000;

// Import route files
const productRoutes = require("./routes/productRoutes.js");
const authRoutes = require("./routes/authRoutes.js");
const cartRoutes = require("./routes/cartRoutes.js");
const orderRoutes = require("./routes/orderRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const reviewRoutes= require("./routes/reviewRoutes.js")
const wishlistRoutes= require("./routes/wishlistRoutes.js")

// Middleware to parse JSON request bodies
app.use(express.json());
app.use(cors());
// Use the routes
app.use("/api/products", productRoutes); // Prefix for product routes
app.use("/api/auth", authRoutes); // Prefix for authentication routes
app.use("/api/cart", cartRoutes); // Prefix for cart routes
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/wishlist", wishlistRoutes);


// Middleware to serve static files (HTML, CSS, JS) from the public folder
app.use(express.static("public"));

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
