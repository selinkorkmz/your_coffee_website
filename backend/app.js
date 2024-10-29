const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const productRoutes = require('./routes/productRoutes.js'); // Import product routes
const authRoutes = require('./routes/authRoutes.js');
const cartRoutes = require('./routes/cartRoutes.js');

app.use(express.json()); // To parse JSON request bodies

// Use the product routes
app.use(productRoutes);
app.use(authRoutes);
app.use(cartRoutes);
// Middleware to serve static files (HTML, CSS, JS) from the public folder
app.use(express.static('public'));

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
