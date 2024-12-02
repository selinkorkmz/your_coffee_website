const db = require("../models/database");

// Function to submit a comment
const submitComment = async (productId, { userId, comment, rating }) => {
  return new Promise((resolve, reject) => {
    const query = `
            INSERT INTO Ratings (user_id, product_id, comment, rating, approved)
            VALUES (?, ?, ?, ?, 0);
        `;
    db.run(query, [userId, productId, comment, rating], function (err) {
      if (err) {
        console.error("Error submitting comment:", err.message);
        return reject({ status: 500, message: "Failed to submit comment." });
      }
      resolve({ reviewId: this.lastID, createdAt: new Date().toISOString() });
    });
  });
};

// Function to submit a rating
const submitRating = async (productId, { userId, rating }) => {
  return new Promise((resolve, reject) => {
    const query = `
            INSERT INTO Ratings (user_id, product_id, rating, approved)
            VALUES (?, ?, ?, 1);
        `;
    db.run(query, [userId, productId, rating], function (err) {
      if (err) {
        console.error("Error submitting rating:", err.message);
        return reject({ status: 500, message: "Failed to submit rating." });
      }
      resolve({ reviewId: this.lastID, createdAt: new Date().toISOString() });
    });
  });
};

// Function to get all approved reviews for a product
const getProductReviews = async (productId) => {
  return new Promise((resolve, reject) => {
    const query = `
            SELECT r.review_id, u.name, r.rating, r.comment, r.created_at
            FROM Ratings r
            JOIN Users u ON u.user_id = r.user_id
            WHERE product_id = ? AND approved = 1;
        `;
    db.all(query, [productId], (err, rows) => {
      if (err) {
        console.error("Error fetching reviews:", err.message);
        return reject({ status: 500, message: "Failed to fetch reviews." });
      }
      resolve(rows);
    });
  });
};

// Function to get pending reviews
const getPendingReviews = async () => {
  return new Promise((resolve, reject) => {
    const query = `
            SELECT review_id, user_id, rating, comment
            FROM Ratings
            WHERE approved = 0;
        `;
    db.all(query, [], (err, rows) => {
      if (err) {
        console.error("Error fetching pending reviews:", err.message);
        return reject({
          status: 500,
          message: "Failed to fetch pending reviews.",
        });
      }
      resolve(rows);
    });
  });
};

// Function to moderate a review
const moderateReview = async (reviewId, { approved }) => {
  return new Promise((resolve, reject) => {
    const query = `
            UPDATE Ratings
            SET approved = ?
            WHERE review_id = ?;
        `;
    db.run(query, [approved, reviewId], function (err) {
      if (err) {
        console.error("Error moderating review:", err.message);
        return reject({ status: 500, message: "Failed to moderate review." });
      }
      resolve({ message: "Review moderated successfully." });
    });
  });
};

module.exports = {
  submitComment,
  submitRating,
  getProductReviews,
  moderateReview,
  getPendingReviews,
};
