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
            console.log("...")
        }
    });
};


const getProductByField = (field, value, callback) => {
    const query = `SELECT * FROM Products WHERE ${field} = ?`;

    db.all(query, [value], (err, row) => {
        if (err) {
            console.error(`Error fetching product by ${field}:`, err.message);
            callback(err, null);
        } else {
            callback(null, row); // Return the product that matches the field
        }
    });
};


// Function to get a coffee by its product_id
/*const getCoffeeByProductId = (productId, callback) => {
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
};*/


const addProduct = (product, callback) => {
    const { 
        name, 
        description, 
        model, 
        serial_number, 
        price, 
        discounted_price, 
        quantity_in_stock, 
        warranty_status, 
        distributor_info, 
        origin, 
        roast_level, 
        power_usage, 
        category 
    } = product;

    // Define the SQL query for inserting a new product with the updated fields
    const query = `
        INSERT INTO Products (name, description, model, serial_number, price, discounted_price, quantity_in_stock, 
                              warranty_status, distributor_info, origin, roast_level, power_usage, category)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    // Execute the query with the provided product details
    db.run(query, [
        name, 
        description, 
        model, 
        serial_number, 
        price, 
        discounted_price, 
        quantity_in_stock, 
        warranty_status, 
        distributor_info, 
        origin, 
        roast_level, 
        power_usage, 
        category
    ], function (err) {
        if (err) {
            console.error('Error adding product:', err.message);
            callback(err, null); // Return error if the query fails
        } else {
            callback(null, { productId: this.lastID }); // Return the new product's ID
        }
    });
};


const getAllCategories = (callback) => {
    const query = `SELECT DISTINCT category FROM Products`;
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Error fetching categories:', err.message);
            callback(err, null);
        } else {
            const categories = rows.map(row => row.category); // Extract category names
            callback(null, categories);
        }
    });
};

const searchProducts = (searchTerm, callback) => {
    const query = `
        SELECT * FROM Products
        WHERE name LIKE ?
        OR description LIKE ?
        OR category LIKE ?
        OR distributor_info LIKE ?
    `;

    // The search term needs to have ⁠ % ⁠ added for partial matching
    const searchValue =`%${searchTerm}%`;

    db.all(query, [searchValue, searchValue, searchValue, searchValue], (err, rows) => {
        if (err) {
            console.error('Error searching products:', err.message);
            callback(err, null);
        } else {
            callback(null, rows); // Return matching products
        }
    });
};



module.exports = { getProductByField,getAllProducts,getProductById, addProduct,getAllCategories,searchProducts};
