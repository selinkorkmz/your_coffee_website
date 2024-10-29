const sqlite3 = require('sqlite3').verbose();
const md5 = require('md5');

const DBSOURCE = "yourcoffee.db";

let db = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) {
        console.error(err.message);
        throw err;
    } else {
        console.log('Connected to the SQLite database.');

        // Create Products table (central table for all products)
        db.run(`CREATE TABLE IF NOT EXISTS Products (
            product_id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            price REAL NOT NULL,
            quantity_in_stock INTEGER NOT NULL,
            warranty_status TEXT,
            distributor_info TEXT,
            category TEXT CHECK(category IN ('Coffee', 'Coffee Machine')) NOT NULL
        )`, (err) => {
            if (err) {
                console.error('Products table creation error:', err.message);
            } else {
                // Insert sample data into Products table
                const insert = 'INSERT INTO Products (name, description, price, quantity_in_stock, warranty_status, distributor_info, category) VALUES (?,?,?,?,?,?,?)';
                //db.run(insert, ["Espresso Blend", "A rich and smooth espresso blend.", 15.99, 100, "1 year", "CoffeeCo", "Coffee"]);
                //db.run(insert, ["House Blend", "Balanced and flavorful house blend.", 12.99, 50, "6 months", "CoffeeCo", "Coffee"]);
                //db.run(insert, ["Espresso Machine", "High-quality espresso machine.", 199.99, 20, "2 years", "MachineMakers", "Coffee Machine"]);
                //db.run(insert, ["Drip Coffee Maker", "Easy-to-use drip coffee maker.", 49.99, 30, "1 year", "MachineMakers", "Coffee Machine"]);
            }
        });

        // Create Coffees table with foreign key reference to Products
        db.run(`CREATE TABLE IF NOT EXISTS Coffees (
            coffee_id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_id INTEGER UNIQUE,
            origin TEXT,
            roast_level TEXT,
            FOREIGN KEY (product_id) REFERENCES Products(product_id)
        )`, (err) => {
            if (err) {
                console.error('Coffees table creation error:', err.message);
            }
        });

        // Create CoffeeMachines table with foreign key reference to Products
        db.run(`CREATE TABLE IF NOT EXISTS CoffeeMachines (
            machine_id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_id INTEGER UNIQUE,
            power_usage TEXT,
            warranty_period TEXT,
            FOREIGN KEY (product_id) REFERENCES Products(product_id)
        )`, (err) => {
            if (err) {
                console.error('CoffeeMachines table creation error:', err.message);
            }
        });

        // Create Users table with shopping_cart as a JSON text field
        db.run(`CREATE TABLE IF NOT EXISTS Users (
            user_id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL, 
            password TEXT NOT NULL, 
            role TEXT CHECK(role IN ('Customer', 'Sales Manager', 'Product Manager')) DEFAULT 'Customer',
            shopping_cart TEXT
        )`, (err) => {
            if (err) {
                console.error('Users table creation error:', err.message);
            } else {
                const insert = 'INSERT INTO Users (name, email, password, role, shopping_cart) VALUES (?,?,?,?,?)';
               // db.run(insert, ["Admin", "admin@example.com", md5("admin123456"), "Product Manager", JSON.stringify([])]);
                //db.run(insert, ["John Doe", "johndoe@example.com", md5("password123"), "Customer", JSON.stringify([])]);
            }
        });

        // Create Orders table with foreign keys for user_id and product_id
        db.run(`CREATE TABLE IF NOT EXISTS Orders (
            order_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            product_id INTEGER,
            quantity INTEGER NOT NULL,
            price_at_purchase REAL NOT NULL,
            total_price REAL NOT NULL,
            order_status TEXT CHECK(order_status IN ('Processing', 'In-Transit', 'Delivered')),
            order_date DATE NOT NULL,
            delivery_address TEXT,
            FOREIGN KEY (user_id) REFERENCES Users(user_id),
            FOREIGN KEY (product_id) REFERENCES Products(product_id)
        )`, (err) => {
            if (err) {
                console.error('Orders table creation error:', err.message);
            }
        });

        // Create Ratings table for reviews and ratings on products
        db.run(`CREATE TABLE IF NOT EXISTS Ratings (
            review_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            product_id INTEGER,
            rating INTEGER CHECK(rating BETWEEN 1 AND 5),
            comment TEXT,
            approved BOOLEAN DEFAULT 0,
            FOREIGN KEY (user_id) REFERENCES Users(user_id),
            FOREIGN KEY (product_id) REFERENCES Products(product_id)
        )`, (err) => {
            if (err) {
                console.error('Ratings table creation error:', err.message);
            }
        });

        // Create Invoices table
        db.run(`CREATE TABLE IF NOT EXISTS Invoices (
            invoice_id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER,
            user_id INTEGER,
            total_price REAL NOT NULL,
            invoice_date DATE NOT NULL,
            FOREIGN KEY (order_id) REFERENCES Orders(order_id),
            FOREIGN KEY (user_id) REFERENCES Users(user_id)
        )`, (err) => {
            if (err) {
                console.error('Invoices table creation error:', err.message);
            }
        });
    }
});

module.exports = db;
