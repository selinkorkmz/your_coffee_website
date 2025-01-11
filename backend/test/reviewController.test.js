const db = require("../models/database");
const {
  submitComment,
  submitRating,
  getProductReviews,
  getPendingReviews,
  moderateReview,
} = require("../controllers/reviewController");

jest.mock("../models/database");

describe("reviewController tests", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("submitComment", () => {
    it("should resolve with the reviewId and createdAt when the comment is submitted successfully", async () => {
      db.run.mockImplementation((query, params, callback) => {
        callback(null); // No error
        db.run.mock.instances[0].lastID = 1; // Mock the lastID
      });

      const result = await submitComment(1, {
        userId: 2,
        comment: "Great product!",
        rating: 5,
      });

      expect(result).toHaveProperty("reviewId", 1);
      expect(result).toHaveProperty("createdAt");
    });

    it("should reject with an error message when the query fails", async () => {
      db.run.mockImplementation((query, params, callback) => {
        callback(new Error("Database error"));
      });

      await expect(
        submitComment(1, {
          userId: 2,
          comment: "Great product!",
          rating: 5,
        })
      ).rejects.toEqual({ status: 500, message: "Failed to submit comment." });
    });
  });
});
