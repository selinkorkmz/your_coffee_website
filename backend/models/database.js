const sqlite3 = require('sqlite3').verbose();

const DBSOURCE = "yourcoffee.db";

let db = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) {
        console.error(err.message);
        throw err;
    } else {
        console.log('Connected to the SQLite database.');

        db.run(`CREATE TABLE IF NOT EXISTS Products (
            product_id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            model TEXT,
            serial_number TEXT NOT NULL,
            price REAL NOT NULL,
            discounted_price REAL,
            quantity_in_stock INTEGER NOT NULL,
            warranty_status TEXT,
            distributor_info TEXT,
            origin TEXT,
            roast_level TEXT,
            power_usage TEXT,
            category TEXT NOT NULL
        )`, (err) => {
            if (err) {
                console.error('Products table creation error:', err.message);
            } else {
                const insert = `INSERT INTO Products 
                    (name, description, model, serial_number, price,discounted_price, quantity_in_stock, warranty_status, distributor_info, origin, roast_level, power_usage, category) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        
                // Inserting coffee product examples
                //db.run(insert, ["Espresso Blend", "A rich and smooth espresso blend.", "Model1", "SN123", 15.99,null, 100, "1 year", "CoffeeCo", "Brazil", "Medium", null, "Coffee"]);
                //db.run(insert, ["House Blend", "Balanced and flavorful house blend.", "Model2", "SN124", 12.99, null,50, "6 months", "CoffeeCo", "Colombia", "Dark", null, "Coffee"]);
        
                // Inserting coffee machine examples
              // db.run(insert, ["Espresso Machine", "High-quality espresso machine.", "X100", "SN200", 199.99,null, 20, "2 years", "MachineMakers", null, null, "1500W", "Coffee Machine"]);
            //db.run(insert, ["Drip Coffee Maker", "Easy-to-use drip coffee maker.", "D200", "SN201", 49.99,null, 30, "1 year", "MachineMakers", null, null, "800W", "Coffee Machine"]);
            }
        });


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
                // Note: Password should be hashed before being inserted using bcrypt (handled in authController).

                // Example insert statement to create an Admin user:
                const bcrypt = require('bcryptjs');
                const hashedPassword = bcrypt.hashSync('password123', 10); // Hash the password

                // Insert the Admin user
                db.get("select * from Users where email = ?", ["admin@example.com"], (err, res) => {
                    if (!res) {
                        db.run(insert, ["Admin User", "admin@example.com", hashedPassword, "Product Manager", JSON.stringify([])], (err) => {
                            if (err) {
                                console.error('Admin user insertion error:', err.message);
                            } else {
                                console.log('Admin user created successfully.');
                            }
                        });
                    }
                })
                db.get("select * from Users where email = ?", ["sales@example.com"], (err, res) => {
                    if (!res) {
                        db.run(insert, ["Sales User", "sales@example.com", hashedPassword, "Sales Manager", JSON.stringify([])], (err) => {
                            if (err) {
                                console.error('Sales user insertion error:', err.message);
                            } else {
                                console.log('Sales user created successfully.');
                            }
                        });
                    }
                })
            }
        });
    
        
        db.run(`CREATE TABLE IF NOT EXISTS Orders (
            order_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            total_price REAL NOT NULL,
            order_status TEXT CHECK(order_status IN ('Processing', 'In-Transit', 'Delivered', 'Canceled', 'Returned')) DEFAULT 'Processing',
            order_date DATE NOT NULL,
            delivery_address TEXT,
            payment_status TEXT CHECK(payment_status IN ('Pending', 'Completed', 'Failed')) DEFAULT 'Pending',
            payment_method TEXT,
            transaction_date DATE,
            FOREIGN KEY (user_id) REFERENCES Users(user_id)
        )`, (err) => {
            if (err) {
                console.error('Orders table creation error:', err.message);
            } else {
                console.log('Orders table created successfully.');
            }
        });

        db.run(`CREATE TABLE IF NOT EXISTS OrderItems (
            order_item_id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_id INTEGER,
            order_id INTEGER,
            quantity INTEGER NOT NULL,
            price_at_purchase REAL NOT NULL,
            total_price REAL NOT NULL,
            FOREIGN KEY (product_id) REFERENCES Products(product_id),
            FOREIGN KEY (order_id) REFERENCES Orders(order_id)
        )`, (err) => {
            if (err) {
                console.error('Orders Items table creation error:', err.message);
            } else {
                console.log('Orders Items table created successfully.');
            }
        });



        // Create Ratings table for reviews and ratings on products
        db.run(`CREATE TABLE IF NOT EXISTS Ratings (
            review_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            product_id INTEGER,
            rating REAL CHECK(rating >= 1.0 AND rating <= 5.0),
            comment TEXT,
            approved BOOLEAN DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
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
        
        //Create shoppingcart table
        db.run(`CREATE TABLE IF NOT EXISTS ShoppingCart (
            cart_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            quantity INTEGER NOT NULL,
            -- Product details (copied from Products at the time of adding to cart)
            name TEXT NOT NULL,
            description TEXT,
            model TEXT,
            serial_number TEXT NOT NULL,
            price REAL NOT NULL,
            discounted_price REAL,
            quantity_in_stock INTEGER NOT NULL,
            warranty_status TEXT,
            distributor_info TEXT,
            origin TEXT,
            roast_level TEXT,
            power_usage TEXT,
            category TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES Users(user_id),
            FOREIGN KEY (product_id) REFERENCES Products(product_id)
        )`, (err) => {
            if (err) {
                console.error('ShoppingCart table creation error:', err.message);
            }
        });

        db.run(`CREATE TABLE IF NOT EXISTS Wishlist (
            wishlist_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            description TEXT,
            model TEXT,
            serial_number TEXT NOT NULL,
            price REAL NOT NULL,
            discounted_price REAL,
            quantity_in_stock INTEGER NOT NULL,
            warranty_status TEXT,
            distributor_info TEXT,
            origin TEXT,
            roast_level TEXT,
            power_usage TEXT,
            category TEXT CHECK(category IN ('Coffee', 'Coffee Machine')) NOT NULL,
            added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES Users(user_id),
            FOREIGN KEY (product_id) REFERENCES Products(product_id)
        )`, (err) => {
            if (err) {
                console.error('Wishlist table creation error:', err.message);
            } else {
                console.log('Wishlist table created successfully.');
            }
        });
        
    }
});

module.exports = db;
