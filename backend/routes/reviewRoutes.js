const express = require("express");
const {
  submitComment,
  submitRating,
  getProductReviews,
  moderateReview,
  getPendingReviews,
} = require("../controllers/reviewController");
const authenticateJWT = require("../middlewares/authMiddleware.js"); // JWT authentication middleware
const authorizeRole = require("../middlewares/authorizeRole.js"); // Role-based authorization middleware

const router = express.Router();

// Error handling middleware
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Submit a comment
router.post(
  "/:productId/comments",
  authenticateJWT,
  authorizeRole(["Customer"]),
  asyncHandler(async (req, res) => {
    try {
      const { userId, comment, rating } = req.body;
      const result = await submitComment(req.params.productId, {
        userId,
        comment,
        rating,
      });
      res
        .status(201)
        .json({ message: "Comment submitted successfully.", result });
    } catch (err) {
      res.status(err.status || 500).json({ message: err.message });
    }
  })
);

// Submit a rating
router.post(
  "/:productId/ratings",
  authenticateJWT,
  authorizeRole(["Customer"]),
  asyncHandler(async (req, res) => {
    try {
      const { userId, rating } = req.body;
      const result = await submitRating(req.params.productId, {
        userId,
        rating,
      });
      res
        .status(201)
        .json({ message: "Rating submitted successfully.", result });
    } catch (err) {
      res.status(err.status || 500).json({ message: err.message });
    }
  })
);

// Get all approved reviews for a product
router.get(
  "/:productId/reviews",
  asyncHandler(async (req, res) => {
    try {
      const reviews = await getProductReviews(req.params.productId);
      res
        .status(200)
        .json({ message: "Reviews fetched successfully.", reviews });
    } catch (err) {
      res.status(err.status || 500).json({ message: err.message });
    }
  })
);

router.get(
  "/pending-reviews",
  authenticateJWT,
  authorizeRole(["Product Manager", "Admin"]),
  asyncHandler(async (req, res) => {
    try {
      const reviews = await getPendingReviews();
      res
        .status(200)
        .json({ message: "Pending reviews fetched successfully.", reviews });
    } catch (err) {
      res.status(err.status || 500).json({ message: err.message });
    }
  })
);

// Moderate a review
router.put(
  "/:reviewId/moderate",
  authenticateJWT,
  authorizeRole(["Product Manager", "Admin"]),
  asyncHandler(async (req, res) => {
    try {
      const { approved } = req.body;
      console.log(req.params.reviewId, approved);
      const result = await moderateReview(req.params.reviewId, { approved });
      res.status(200).json(result);
    } catch (err) {
      res.status(err.status || 500).json({ message: err.message });
    }
  })
);

module.exports = router;
