const { addToCart, removeFromCart, getShoppingCart } = require('../controllers/cartController');
const db = require('../models/database');

jest.mock('../models/database');

describe('Cart Controller Tests', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('addToCart', () => {
        it('should update the quantity if the product is already in the cart', (done) => {
            const userId = 1;
            const productId = 101;
            const quantity = 3;

            // Mock stock check
            db.get.mockImplementationOnce((query, params, callback) => {
                callback(null, { product_id: productId, quantity_in_stock: 10 });
            });

            // Mock product already in cart
            db.get.mockImplementationOnce((query, params, callback) => {
                callback(null, { quantity: 2 });
            });

            db.run.mockImplementationOnce((query, params, callback) => {
                callback(null);
            });

            addToCart(userId, productId, quantity, (err, message) => {
                expect(err).toBeNull();
                expect(message).toBe('Product quantity updated in the cart.');
                done();
            });
        });

        it('should return an error if the total quantity exceeds stock', (done) => {
            const userId = 1;
            const productId = 101;
            const quantity = 9;

            // Mock stock check
            db.get.mockImplementationOnce((query, params, callback) => {
                callback(null, { product_id: productId, quantity_in_stock: 10 });
            });

            // Mock product already in cart
            db.get.mockImplementationOnce((query, params, callback) => {
                callback(null, { quantity: 5 });
            });

            addToCart(userId, productId, quantity, (err, message) => {
                expect(err).toEqual(new Error('Total quantity in cart exceeds available stock.'));
                expect(message).toBeUndefined();
                done();
            });
        });

        it('should handle database errors during stock check', (done) => {
            const userId = 1;
            const productId = 101;
            const quantity = 2;

            // Mock stock check error
            db.get.mockImplementationOnce((query, params, callback) => {
                callback(new Error('Database error'), null);
            });

            addToCart(userId, productId, quantity, (err, message) => {
                expect(err).toEqual(new Error('Database error'));
                expect(message).toBeUndefined();
                done();
            });
        });

        it('should handle database errors during cart update', (done) => {
            const userId = 1;
            const productId = 101;
            const quantity = 2;

            // Mock stock check
            db.get.mockImplementationOnce((query, params, callback) => {
                callback(null, { product_id: productId, quantity_in_stock: 10 });
            });

            // Mock product already in cart
            db.get.mockImplementationOnce((query, params, callback) => {
                callback(null, { quantity: 2 });
            });

            // Mock cart update error
            db.run.mockImplementationOnce((query, params, callback) => {
                callback(new Error('Cart update error'));
            });

            addToCart(userId, productId, quantity, (err, message) => {
                expect(err).toEqual(new Error('Cart update error'));
                expect(message).toBeUndefined();
                done();
            });
        });
    });

    describe('removeFromCart', () => {
        it('should return an error if the quantity to remove exceeds the quantity in the cart', (done) => {
            const userId = 1;
            const productId = 101;
            const quantity = 5;

            // Mock find cart item
            db.get.mockImplementationOnce((query, params, callback) => {
                callback(null, { quantity: 3 });
            });

            removeFromCart(userId, productId, quantity, (err, result) => {
                expect(err).toEqual(new Error('Quantity to remove exceeds quantity in cart.'));
                expect(result).toBeUndefined();
                done();
            });
        });

        it('should handle database errors during cart item deletion', (done) => {
            const userId = 1;
            const productId = 101;
            const quantity = 2;

            // Mock find cart item
            db.get.mockImplementationOnce((query, params, callback) => {
                callback(null, { quantity: 2 });
            });

            // Mock delete cart item error
            db.run.mockImplementationOnce((query, params, callback) => {
                callback(new Error('Deletion error'));
            });

            removeFromCart(userId, productId, quantity, (err, result) => {
                expect(err).toEqual(new Error('Deletion error'));
                expect(result).toBeUndefined();
                done();
            });
        });

        it('should handle database errors during cart item quantity update', (done) => {
            const userId = 1;
            const productId = 101;
            const quantity = 1;

            // Mock find cart item
            db.get.mockImplementationOnce((query, params, callback) => {
                callback(null, { quantity: 3 });
            });

            // Mock update cart item error
            db.run.mockImplementationOnce((query, params, callback) => {
                callback(new Error('Update error'));
            });

            removeFromCart(userId, productId, quantity, (err, result) => {
                expect(err).toEqual(new Error('Update error'));
                expect(result).toBeUndefined();
                done();
            });
        });
    });

    describe('getShoppingCart', () => {
        it('should return detailed product information for each cart item', (done) => {
            const userId = 1;

            const mockCart = [
                { product_id: 101, quantity: 2, name: 'Product A', price: 100, category: 'Coffee' },
                { product_id: 102, quantity: 1, name: 'Product B', price: 50, category: 'Tea' },
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

        it('should handle database errors during shopping cart retrieval', (done) => {
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
