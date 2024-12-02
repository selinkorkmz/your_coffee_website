const { addToCart, removeFromCart, getShoppingCart } = require('../controllers/cartController');
const db = require('../models/database');

jest.mock('../models/database');

describe('Cart Controller Tests', () => {
    describe('addToCart', () => {
        it('should add a product to the cart if stock is sufficient', (done) => {
            const userId = 1;
            const productId = 101;
            const quantity = 2;

            // Mock stock check
            db.get.mockImplementationOnce((query, params, callback) => {
                callback(null, { product_id: productId, quantity_in_stock: 10 });
            });

            // Mock addOrUpdateCart call
            db.get.mockImplementationOnce((query, params, callback) => {
                callback(null, null); // Product not in cart
            });

            db.run.mockImplementationOnce((query, params, callback) => {
                callback(null); // Successful insertion
            });

            addToCart(userId, productId, quantity, (err, message) => {
                expect(err).toBeNull();
                expect(message).toBe('Product added to the cart.');
                done();
            });
        });

        it('should return an error if stock is insufficient', (done) => {
            const userId = 1;
            const productId = 101;
            const quantity = 5;

            // Mock stock check
            db.get.mockImplementationOnce((query, params, callback) => {
                callback(null, { product_id: productId, quantity_in_stock: 2 });
            });

            addToCart(userId, productId, quantity, (err, message) => {
                expect(err).toEqual(new Error('Insufficient stock.'));
                expect(message).toBeUndefined();
                done();
            });
        });

        it('should return an error if product is not found', (done) => {
            const userId = 1;
            const productId = 999; // Non-existent product
            const quantity = 1;

            // Mock stock check
            db.get.mockImplementationOnce((query, params, callback) => {
                callback(null, null); // Product not found
            });

            addToCart(userId, productId, quantity, (err, message) => {
                expect(err).toEqual(new Error('Product not found.'));
                expect(message).toBeUndefined();
                done();
            });
        });
    });

    describe('removeFromCart', () => {
        it('should remove a product from the cart if quantity becomes zero', (done) => {
            const userId = 1;
            const productId = 101;
            const quantity = 2;

            // Mock find cart item
            db.get.mockImplementationOnce((query, params, callback) => {
                callback(null, { quantity: 2 });
            });

            // Mock delete cart item
            db.run.mockImplementationOnce((query, params, callback) => {
                callback(null);
            });

            removeFromCart(userId, productId, quantity, (err, result) => {
                expect(err).toBeNull();
                expect(result).toEqual({ message: 'Item removed from cart.' });
                done();
            });
        });

        it('should update the quantity in the cart if quantity is reduced', (done) => {
            const userId = 1;
            const productId = 101;
            const quantity = 1;

            // Mock find cart item
            db.get.mockImplementationOnce((query, params, callback) => {
                callback(null, { quantity: 3 });
            });

            // Mock update cart item
            db.run.mockImplementationOnce((query, params, callback) => {
                callback(null);
            });

            removeFromCart(userId, productId, quantity, (err, result) => {
                expect(err).toBeNull();
                expect(result).toEqual({ message: 'Cart item quantity updated.', quantity: 2 });
                done();
            });
        });

        it('should return an error if the item is not in the cart', (done) => {
            const userId = 1;
            const productId = 101;

            // Mock find cart item
            db.get.mockImplementationOnce((query, params, callback) => {
                callback(null, null); // Item not found in cart
            });

            removeFromCart(userId, productId, 1, (err, result) => {
                expect(err).toEqual(new Error('Item not found in cart.'));
                expect(result).toBeUndefined();
                done();
            });
        });
    });

    describe('getShoppingCart', () => {
        it('should return the user\'s shopping cart', (done) => {
            const userId = 1;

            const mockCart = [
                { product_id: 101, quantity: 2, name: 'Product A', price: 100 },
                { product_id: 102, quantity: 1, name: 'Product B', price: 50 },
            ];

            // Mock fetching shopping cart
            db.all.mockImplementationOnce((query, params, callback) => {
                callback(null, mockCart);
            });

            getShoppingCart(userId, (err, cart) => {
                expect(err).toBeNull();
                expect(cart).toEqual(mockCart);
                done();
            });
        });

        it('should return an empty array if the cart is empty', (done) => {
            const userId = 1;

            // Mock empty cart
            db.all.mockImplementationOnce((query, params, callback) => {
                callback(null, []);
            });

            getShoppingCart(userId, (err, cart) => {
                expect(err).toBeNull();
                expect(cart).toEqual([]);
                done();
            });
        });

        it('should return an error if the query fails', (done) => {
            const userId = 1;

            // Mock query failure
            db.all.mockImplementationOnce((query, params, callback) => {
                callback(new Error('Database error'), null);
            });

            getShoppingCart(userId, (err, cart) => {
                expect(err).toEqual(new Error('Database error'));
                expect(cart).toBeNull();
                done();
            });
        });
    });
});
