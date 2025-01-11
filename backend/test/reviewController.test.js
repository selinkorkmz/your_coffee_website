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
  describe("submitRating", () => {
    it("should resolve with the reviewId and createdAt when the rating is submitted successfully", async () => {
      db.run.mockImplementation((query, params, callback) => {
        callback(null); // No error
        db.run.mock.instances[0].lastID = 2; // Mock the lastID
      });

      const result = await submitRating(1, {
        userId: 3,
        rating: 4,
      });

      expect(result).toHaveProperty("reviewId", 2);
      expect(result).toHaveProperty("createdAt");
    });

    it("should reject with an error message when the query fails", async () => {
      db.run.mockImplementation((query, params, callback) => {
        callback(new Error("Database error"));
      });

      await expect(
        submitRating(1, {
          userId: 3,
          rating: 4,
        })
      ).rejects.toEqual({ status: 500, message: "Failed to submit rating." });
    });
  });

  describe("getProductReviews", () => {
    it("should resolve with a list of reviews for the product", async () => {
      const mockReviews = [
        {
          review_id: 1,
          name: "Alice",
          rating: 5,
          comment: "Excellent!",
          created_at: "2025-01-10T10:00:00Z",
        },
      ];
      db.all.mockImplementation((query, params, callback) => {
        callback(null, mockReviews);
      });

      const result = await getProductReviews(1);

      expect(result).toEqual(mockReviews);
    });

    it("should reject with an error message when the query fails", async () => {
      db.all.mockImplementation((query, params, callback) => {
        callback(new Error("Database error"), null);
      });

      await expect(getProductReviews(1)).rejects.toEqual({
        status: 500,
        message: "Failed to fetch reviews.",
      });
    });
  });

  describe("getPendingReviews", () => {
    it("should resolve with a list of pending reviews", async () => {
      const mockPendingReviews = [
        {
          review_id: 1,
          user_id: 2,
          rating: 4,
          comment: "Needs improvement",
        },
      ];
      db.all.mockImplementation((query, params, callback) => {
        callback(null, mockPendingReviews);
      });

      const result = await getPendingReviews();

      expect(result).toEqual(mockPendingReviews);
    });

    it("should reject with an error message when the query fails", async () => {
      db.all.mockImplementation((query, params, callback) => {
        callback(new Error("Database error"), null);
      });

      await expect(getPendingReviews()).rejects.toEqual({
        status: 500,
        message: "Failed to fetch pending reviews.",
      });
    });
  });

  describe("moderateReview", () => {
    it("should resolve with a success message when the review is moderated successfully", async () => {
      db.run.mockImplementation((query, params, callback) => {
        callback(null); // No error
      });

      const result = await moderateReview(1, { approved: 1 });

      expect(result).toEqual({ message: "Review moderated successfully." });
    });

    it("should reject with an error message when the query fails", async () => {
      db.run.mockImplementation((query, params, callback) => {
        callback(new Error("Database error"));
      });

      await expect(moderateReview(1, { approved: 1 })).rejects.toEqual({
        status: 500,
        message: "Failed to moderate review.",
      });
    });
  });
});
