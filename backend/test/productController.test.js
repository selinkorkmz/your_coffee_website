const {
    updateProductStock,
    getProductByField,
    getAllProducts,
    getProductById,
    addProduct,
    getAllCategories,
    searchProducts,
    setDiscountOnProduct,
    updateProductPrice,
    deleteProduct,
  } = require("../controllers/productController");
  
  const db = require("../models/database");
  const { getProductReviews } = require("../controllers/reviewController");
  const { alertUserWishlist } = require("../controllers/wishlistController");
  
  jest.mock("../models/database");
  jest.mock("../controllers/reviewController");
  jest.mock("../controllers/wishlistController");
  
  describe("Product Controller Tests", () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    describe("getProductById", () => {
      it("should return a product by its ID", (done) => {
        const productId = 1;
        const mockProduct = { product_id: 1, name: "Espresso Blend" };
  
        db.get.mockImplementationOnce((query, params, callback) => {
          callback(null, mockProduct);
        });
  
        getProductById(productId, (err, product) => {
          expect(err).toBeNull();
          expect(product).toEqual(mockProduct);
          done();
        });
      });
  
      it("should handle database errors gracefully", (done) => {
        db.get.mockImplementationOnce((query, params, callback) => {
          callback(new Error("Database error"), null);
        });
  
        getProductById(1, (err, product) => {
          expect(err).toEqual(new Error("Database error"));
          expect(product).toBeNull();
          done();
        });
      });
    });
  
    describe("getAllProducts", () => {
      it("should handle an empty product list", (done) => {
        db.all.mockImplementationOnce((query, params, callback) => {
          callback(null, []);
        });
  
        getAllProducts((err, products) => {
          expect(err).toBeNull();
          expect(products).toEqual([]);
          done();
        });
      });
  
      it("should handle rating fetch errors and set rating to null", (done) => {
        const mockProducts = [{ product_id: 1, name: "Espresso Blend" }];
  
        db.all.mockImplementationOnce((query, params, callback) => {
          callback(null, mockProducts);
        });
  
        getProductReviews.mockRejectedValueOnce(new Error("Rating fetch error"));
  
        getAllProducts((err, products) => {
          expect(err).toBeNull();
          expect(products).toEqual([{ ...mockProducts[0], rating: null }]);
          done();
        });
      });
    });
  
    describe("addProduct", () => {
      it("should return an error if mandatory fields are missing", (done) => {
        const invalidProduct = {
          name: "Missing Data",
          price: 10.99,
        };
  
        addProduct(invalidProduct, (err, result) => {
          expect(err).toBeDefined();
          expect(result).toBeNull();
          done();
        });
      });
    });
  
    describe("updateProductStock", () => {
      it("should handle database errors during stock update", (done) => {
        db.run.mockImplementationOnce((query, params, callback) => {
          callback(new Error("Update error"));
        });
  
        updateProductStock(1, 50, (err, result) => {
          expect(err).toEqual(new Error("Update error"));
          expect(result).toBeUndefined();
          done();
        });
      });
  
      it("should return an error if the product ID does not exist", (done) => {
        db.run.mockImplementationOnce((query, params, callback) => {
          callback.call({ changes: 0 }, null);
        });
  
        updateProductStock(999, 50, (err, result) => {
          expect(err).toEqual(new Error("Product not found."));
          expect(result).toBeUndefined();
          done();
        });
      });
    });
  
    describe("searchProducts", () => {
      it("should return matching products", (done) => {
        const searchTerm = "coffee";
        const mockProducts = [{ name: "Coffee A" }, { name: "Coffee B" }];
  
        db.all.mockImplementationOnce((query, params, callback) => {
          callback(null, mockProducts);
        });
  
        searchProducts(searchTerm, (err, products) => {
          expect(err).toBeNull();
          expect(products).toEqual(mockProducts);
          done();
        });
      });
  
      it("should return an empty array for no matches", (done) => {
        const searchTerm = "nonexistent";
        db.all.mockImplementationOnce((query, params, callback) => {
          callback(null, []);
        });
  
        searchProducts(searchTerm, (err, products) => {
          expect(err).toBeNull();
          expect(products).toEqual([]);
          done();
        });
      });
    });
  
    describe("deleteProduct", () => {
      it("should handle database errors during deletion", (done) => {
        db.run.mockImplementationOnce((query, params, callback) => {
          callback(new Error("Deletion error"));
        });
  
        deleteProduct(1, (err, result) => {
          expect(err).toEqual(new Error("Deletion error"));
          expect(result).toBeUndefined();
          done();
        });
      });
    });
  
    describe("setDiscountOnProduct", () => {
      it("should handle errors during price update", (done) => {
        const mockProduct = { product_id: 1, price: 100 };
  
        db.get.mockImplementationOnce((query, params, callback) => {
          callback(null, mockProduct);
        });
  
        db.run.mockImplementationOnce((query, params, callback) => {
          callback(new Error("Price update error"));
        });
  
        setDiscountOnProduct(1, 0.2, (err, result) => {
          expect(err).toEqual(new Error("Price update error"));
          expect(result).toBeNull();
          done();
        });
      });
  
      it("should handle wishlist alert errors", (done) => {
        const mockProduct = { product_id: 1, price: 100 };
  
        db.get.mockImplementationOnce((query, params, callback) => {
          callback(null, mockProduct);
        });
  
        db.run.mockImplementationOnce((query, params, callback) => {
          callback(null);
        });
  
        alertUserWishlist.mockImplementationOnce((productId, newPrice, callback) => {
          callback(new Error("Alert error"));
        });
  
        setDiscountOnProduct(1, 0.2, (err, result) => {
          expect(err).toEqual(new Error("Alert error"));
          expect(result).toBeNull();
          done();
        });
      });
    });
  });
  