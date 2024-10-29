const db = require('../models/database.js'); // Import the database connection


// Function to get a product by its product_id
const getProductById = (productId, callback) => {
    const query = `SELECT * FROM Products WHERE product_id = ?`;

    db.get(query, [productId], (err, row) => {
        if (err) {
            console.error('Error fetching product:', err.message);
            callback(err, null);  // Return error if any
        } else {
            callback(null, row);  // Return the product details
        }
    });
};


const getAllProducts = (callback) => {
    const query = `SELECT * FROM Products`;

    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Error fetching all products:', err.message);
            callback(err, null);
        } else {
            callback(null, rows); // Return all the products
        }
    });
};


const getProductByField = (field, value, callback) => {
    const query = `SELECT * FROM Products WHERE ${field} = ?`;

    db.get(query, [value], (err, row) => {
        if (err) {
            console.error(`Error fetching product by ${field}:`, err.message);
            callback(err, null);
        } else {
            callback(null, row); // Return the product that matches the field
        }
    });
};


// Function to get a coffee by its product_id
const getCoffeeByProductId = (productId, callback) => {
    const query = `
        SELECT Coffees.coffee_id, Products.product_id, Products.name, Products.description, Products.price, 
               Products.quantity_in_stock, Products.warranty_status, Products.distributor_info, 
               Coffees.origin, Coffees.roast_level
        FROM Coffees
        JOIN Products ON Coffees.product_id = Products.product_id
        WHERE Products.product_id = ?
    `;

    db.get(query, [productId], (err, row) => {
        if (err) {
            console.error('Error fetching coffee by product_id:', err.message);
            callback(err, null);
        } else {
            callback(null, row); // Return the coffee details
        }
    });
};

module.exports = { getCoffeeByProductId,getProductByField,getAllProducts,getProductById };
