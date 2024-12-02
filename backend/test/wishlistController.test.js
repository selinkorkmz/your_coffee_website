const { addToWishlist, removeFromWishlist, getWishlist } = require('../controllers/wishlistController');
const db = require('../models/database');

jest.mock('../models/database');

describe('Wishlist Controller Tests', () => {
    describe('addToWishlist', () => {
        it('should add a product to the wishlist if it does not exist', (done) => {
            const userId = 1;
            const productId = 101;

            const mockProduct = {
                product_id: 101,
                name: 'Espresso Blend',
                description: 'Rich coffee blend',
                model: 'ModelX',
                serial_number: 'SN101',
                price: 15.99,
                discounted_price: 12.99,
                quantity_in_stock: 100,
                warranty_status: '1 year',
                distributor_info: 'CoffeeCo',
                origin: 'Brazil',
                roast_level: 'Medium',
                power_usage: null,
                category: 'Coffee'
            };

            // Step 1: Mock product check
            db.get.mockImplementationOnce((query, params, callback) => {
                expect(query).toContain('SELECT * FROM Products WHERE product_id = ?');
                expect(params).toEqual([productId]);
                callback(null, mockProduct);
            });

            // Step 2: Mock wishlist check
            db.get.mockImplementationOnce((query, params, callback) => {
                expect(query).toContain('SELECT * FROM Wishlist WHERE user_id = ? AND product_id = ?');
                expect(params).toEqual([userId, productId]);
                callback(null, null); // Product not in wishlist
            });

            // Step 3: Mock adding product to wishlist
            db.run.mockImplementationOnce((query, params, callback) => {
                expect(query).toContain('INSERT INTO Wishlist');
                expect(params).toEqual([
                    userId, mockProduct.product_id,
                    mockProduct.name, mockProduct.description, mockProduct.model, mockProduct.serial_number,
                    mockProduct.price, mockProduct.discounted_price, mockProduct.quantity_in_stock, mockProduct.warranty_status,
                    mockProduct.distributor_info, mockProduct.origin, mockProduct.roast_level,
                    mockProduct.power_usage, mockProduct.category
                ]);
                callback(null);
            });

            addToWishlist(userId, productId, (err, message) => {
                expect(err).toBeNull();
                expect(message).toBe('Product added to the wishlist.');
                done();
            });
        });

        it('should not add a product already in the wishlist', (done) => {
            const userId = 1;
            const productId = 101;

            // Step 1: Mock product check
            db.get.mockImplementationOnce((query, params, callback) => {
                callback(null, { product_id: 101 }); // Product exists
            });

            // Step 2: Mock wishlist check
            db.get.mockImplementationOnce((query, params, callback) => {
                callback(null, { product_id: 101 }); // Product already in wishlist
            });

            addToWishlist(userId, productId, (err, message) => {
                expect(err).toBeNull();
                expect(message).toBe('Product is already in the wishlist.');
                done();
            });
        });

        it('should return an error if the product does not exist', (done) => {
            const userId = 1;
            const productId = 999;

            db.get.mockImplementationOnce((query, params, callback) => {
                callback(null, null); // Product not found
            });

            addToWishlist(userId, productId, (err, message) => {
                expect(err).toEqual(new Error('Product not found.'));
                expect(message).toBeUndefined();
                done();
            });
        });
    });

    describe('removeFromWishlist', () => {
        it('should remove a product from the wishlist', (done) => {
            const userId = 1;
            const productId = 101;

            db.run.mockImplementationOnce((query, params, callback) => {
                expect(query).toContain('DELETE FROM Wishlist WHERE user_id = ? AND product_id = ?');
                expect(params).toEqual([userId, productId]);
                callback(null);
            });

            removeFromWishlist(userId, productId, (err, message) => {
                expect(err).toBeNull();
                expect(message).toBe('Product removed from the wishlist.');
                done();
            });
        });

        it('should return an error if removing fails', (done) => {
            const userId = 1;
            const productId = 101;

            db.run.mockImplementationOnce((query, params, callback) => {
                callback(new Error('Deletion failed'));
            });

            removeFromWishlist(userId, productId, (err, message) => {
                expect(err).toEqual(new Error('Deletion failed'));
                expect(message).toBeUndefined();
                done();
            });
        });
    });

    describe('getWishlist', () => {
        it('should return an empty array if the wishlist is empty', (done) => {
            const userId = 1;

            db.all.mockImplementationOnce((query, params, callback) => {
                callback(null, []); // Empty wishlist
            });

            getWishlist(userId, (err, wishlist) => {
                expect(err).toBeNull();
                expect(wishlist).toEqual([]);
                done();
            });
        });

        it('should return an error if fetching the wishlist fails', (done) => {
            const userId = 1;

            db.all.mockImplementationOnce((query, params, callback) => {
                callback(new Error('Database error'));
            });

            getWishlist(userId, (err, wishlist) => {
                expect(err).toEqual(new Error('Database error'));
                expect(wishlist).toBeNull();
                done();
            });
        });
    });
  
});