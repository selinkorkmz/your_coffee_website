const db = require("../models/database.js"); // Import the database connection
const { getProductReviews } = require("./reviewController");
const { alertUserWishlist } = require('./wishlistController'); // Import the function

// Function to get a product by its product_id
const getProductById = (productId, callback) => {
  const query = `SELECT * FROM Products WHERE product_id = ?`;

  db.get(query, [productId], (err, row) => {
    if (err) {
      console.error("Error fetching product:", err.message);
      callback(err, null); // Return error if any
    } else {
      callback(null, row); // Return the product details
    }
  });
};

const getAllProducts = (userId, callback) => {
  const query = `
    SELECT p.*, wishlist.wishlist_id
    FROM Products p
    LEFT JOIN (
      SELECT w.product_id as product_id, w.wishlist_id as wishlist_id FROM Wishlist w WHERE w.user_id = ?
    ) wishlist ON p.product_id = wishlist.product_id
  `;

  db.all(query, [userId], async (err, rows) => {
    if (err) {
      console.error("Error fetching all products:", err.message);
      return callback(err, null);
    }

    try {
      const productsWithRatings = await Promise.all(
        rows.map(async (product) => {
          try {
            const rating = await getProductReviews(product.product_id);
            const averageRating =
              rating.reduce((sum, review) => sum + review.rating, 0) /
              rating.length;
            return { ...product, rating: averageRating || 0 };
          } catch (ratingErr) {
            console.error(
              `Error fetching rating for product ${product.product_id}:`,
              ratingErr
            );
            return { ...product, rating: null }; // Return product without rating if there's an error
          }
        })
      );
      callback(null, productsWithRatings);
    } catch (error) {
      console.error("Error processing products with ratings:", error);
      callback(error, null);
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
    category,
    cost
  } = product;

  // Define the SQL query for inserting a new product with the updated fields
  const query = `
        INSERT INTO Products (name, description, model, serial_number,  price, discounted_price, quantity_in_stock, 
                              warranty_status, distributor_info, origin, roast_level, power_usage, category, cost)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

  // Execute the query with the provided product details
  db.run(
    query,
    [
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
      category,
      cost,
    ],
    function (err) {
      if (err) {
        console.error("Error adding product:", err.message);
        callback(err, null); // Return error if the query fails
      } else {
        callback(null, { productId: this.lastID }); // Return the new product's ID
      }
    }
  );
};

const getAllCategories = (callback) => {
  const query = `SELECT DISTINCT category FROM Products`;
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error("Error fetching categories:", err.message);
      callback(err, null);
    } else {
      const categories = rows.map((row) => row.category); // Extract category names
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
  const searchValue = `%${searchTerm}%`;

  db.all(
    query,
    [searchValue, searchValue, searchValue, searchValue],
    (err, rows) => {
      if (err) {
        console.error("Error searching products:", err.message);
        callback(err, null);
      } else {
        callback(null, rows); // Return matching products
      }
    }
  );
};
// Function to apply a discount to a product by its product_id
const setDiscountOnProduct = (productId, discountRate, callback) => {
    console.log('Applying discount:', productId, discountRate);

    if (discountRate < 0 || discountRate >= 1) {
        return callback(new Error('Invalid discount rate'), null);
    }

    // Retrieve the current product price
    getProductById(productId, (err, product) => {
        if (err) return callback(err, null);
        if (!product) return callback(new Error('Product not found'), null);

        // Calculate the new discounted price
        const newPrice = product.price * (1 - discountRate);

        // Update the product's discounted price in the database
        const query = `UPDATE Products SET discounted_price = ? WHERE product_id = ?`;
        db.run(query, [discountRate === 0 ? undefined : newPrice, productId], (updateErr) => {
            if (updateErr) {
                console.error('Error updating product price:', updateErr.message);
                return callback(updateErr, null);
            }

            console.log('Price updated successfully. Notifying wishlist users...');

            // Call alertUserWishlist to notify users
            alertUserWishlist(productId, newPrice, (alertErr, message) => {
                if (alertErr) {
                    console.error('Error alerting users:', alertErr.message);
                    return callback(alertErr, null);
                }

                console.log(message); // Log the result of alerting users
                callback(null, { productId, newPrice, alertMessage: message });
            });
        });
    });
};


// Function to update product quantity_in_stock
const updateProductStock = (productId, quantity, callback) => {
  // Check if quantity is valid (non-negative)
  if (quantity < 0) {
    return callback(new Error('Quantity cannot be negative.'));
  }

  // Update query
  const query = `UPDATE Products SET quantity_in_stock = ? WHERE product_id = ?`;

  db.run(query, [quantity, productId], function (err) {
    if (err) {
      console.error('Error updating product stock:', err.message);
      callback(err);
    } else if (this.changes === 0) {
      // If no rows were updated, product ID does not exist
      callback(new Error('Product not found.'));
    } else {
      callback(null, { message: 'Stock updated successfully', productId });
    }
  });
};

const updateProductPrice = (productId, newPrice, callback) => {
  if (newPrice <= 0) {
      return callback(new Error('Price must be greater than 0.'));
  }

  const query = `UPDATE Products SET price = ? WHERE product_id = ?`;

  db.run(query, [newPrice, productId], function (err) {
      if (err) {
          console.error('Error updating product price:', err.message);
          return callback(err);
      } else if (this.changes === 0) {
          return callback(new Error('Product not found.'));
      } else {
          callback(null, { message: 'Price updated successfully', productId });
      }
  });
};

// Function to delete a product by its product_id
const deleteProduct = (productId, callback) => {
  const query = `DELETE FROM Products WHERE product_id = ?`;

  db.run(query, [productId], function (err) {
    if (err) {
      console.error('Error deleting product:', err.message);
      callback(err); // Return error if the query fails
    } else if (this.changes === 0) {
      // If no rows were deleted, the product ID does not exist
      callback(new Error('Product not found.'));
    } else {
      callback(null, { message: 'Product deleted successfully', productId });
    }
  });
};

module.exports = {
  updateProductStock,
  getProductByField,
  getAllProducts,
  getProductById,
  addProduct,
  getAllCategories,
  searchProducts,
  setDiscountOnProduct,
  updateProductPrice,
  deleteProduct
};
