const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to serve static files (HTML, CSS, JS) from the public folder
app.use(express.static('public'));

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
