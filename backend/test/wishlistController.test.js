const {
    addToWishlist,
    removeFromWishlist,
    getWishlist,
    alertUserWishlist,
} = require('../controllers/wishlistController');
const db = require('../models/database');
const nodemailer = require('nodemailer');

jest.mock('../models/database');
jest.mock('nodemailer');

describe('Wishlist Controller Tests', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('addToWishlist', () => {
        it('should add a product to the wishlist if it does not exist', (done) => {
            const userId = 1;
            const productId = 101;
            const mockProduct = { product_id: 101, name: 'Test Product', category: 'Coffee' };

            db.get
                .mockImplementationOnce((query, params, callback) => callback(null, mockProduct))
                .mockImplementationOnce((query, params, callback) => callback(null, null));
            db.run.mockImplementationOnce((query, params, callback) => callback(null));

            addToWishlist(userId, productId, (err, message) => {
                expect(err).toBeNull();
                expect(message).toBe('Product added to the wishlist.');
                done();
            });
        });

        it('should not add a product already in the wishlist', (done) => {
            db.get
                .mockImplementationOnce((query, params, callback) => callback(null, { product_id: 101 }))
                .mockImplementationOnce((query, params, callback) => callback(null, { product_id: 101 }));

            addToWishlist(1, 101, (err, message) => {
                expect(err).toBeNull();
                expect(message).toBe('Product is already in the wishlist.');
                done();
            });
        });

        it('should return an error if the product does not exist', (done) => {
            db.get.mockImplementationOnce((query, params, callback) => callback(null, null));

            addToWishlist(1, 999, (err, message) => {
                expect(err).toEqual(new Error('Product not found.'));
                expect(message).toBeUndefined();
                done();
            });
        });

        it('should return an error if database query fails', (done) => {
            db.get.mockImplementationOnce((query, params, callback) => callback(new Error('Database error')));

            addToWishlist(1, 101, (err, message) => {
                expect(err).toEqual(new Error('Database error'));
                expect(message).toBeUndefined();
                done();
            });
        });
    });

    describe('removeFromWishlist', () => {
        it('should remove a product from the wishlist', (done) => {
            db.run.mockImplementationOnce((query, params, callback) => callback(null));

            removeFromWishlist(1, 101, (err, message) => {
                expect(err).toBeNull();
                expect(message).toBe('Product removed from the wishlist.');
                done();
            });
        });

        it('should return an error if removing fails', (done) => {
            db.run.mockImplementationOnce((query, params, callback) => callback(new Error('Deletion failed')));

            removeFromWishlist(1, 101, (err, message) => {
                expect(err).toEqual(new Error('Deletion failed'));
                expect(message).toBeUndefined();
                done();
            });
        });
    });

    describe('getWishlist', () => {
        it('should return an empty array if the wishlist is empty', (done) => {
            db.all.mockImplementationOnce((query, params, callback) => callback(null, []));

            getWishlist(1, (err, wishlist) => {
                expect(err).toBeNull();
                expect(wishlist).toEqual([]);
                done();
            });
        });

        it('should return the wishlist with detailed product information', (done) => {
            const mockWishlist = [
                {
                    product_id: 101,
                    name: 'Test Product',
                    price: 12.99,
                    category: 'Coffee',
                },
            ];
            db.all.mockImplementationOnce((query, params, callback) => callback(null, mockWishlist));

            getWishlist(1, (err, wishlist) => {
                expect(err).toBeNull();
                expect(wishlist).toEqual(mockWishlist);
                done();
            });
        });

        it('should return an error if fetching the wishlist fails', (done) => {
            db.all.mockImplementationOnce((query, params, callback) => callback(new Error('Database error')));

            getWishlist(1, (err, wishlist) => {
                expect(err).toEqual(new Error('Database error'));
                expect(wishlist).toBeNull();
                done();
            });
        });
    });

    describe('alertUserWishlist', () => {
        const mockTransporter = {
            sendMail: jest.fn(),
        };

        beforeEach(() => {
            nodemailer.createTransport.mockReturnValue(mockTransporter);
        });

        it('should alert users when a product is discounted', (done) => {
            const mockUsers = [{ email: 'user1@test.com', name: 'User1' }];
            db.all.mockImplementationOnce((query, params, callback) => callback(null, mockUsers));
            mockTransporter.sendMail.mockResolvedValueOnce({});

            alertUserWishlist(101, 9.99, (err, message) => {
                expect(err).toBeNull();
                expect(message).toBe('Users alerted successfully.');
                expect(mockTransporter.sendMail).toHaveBeenCalledTimes(1);
                done();
            });
        });

        it('should handle no users to alert', (done) => {
            db.all.mockImplementationOnce((query, params, callback) => callback(null, []));

            alertUserWishlist(101, 9.99, (err, message) => {
                expect(err).toBeNull();
                expect(message).toBe('No users to alert.');
                expect(mockTransporter.sendMail).not.toHaveBeenCalled();
                done();
            });
        });

        it('should return an error if database query fails', (done) => {
            db.all.mockImplementationOnce((query, params, callback) => callback(new Error('Database error')));

            alertUserWishlist(101, 9.99, (err, message) => {
                expect(err).toEqual(new Error('Error retrieving user emails.'));
                expect(message).toBeUndefined();
                done();
            });
        });

        it('should return an error if email sending fails', (done) => {
            const mockUsers = [{ email: 'user1@test.com', name: 'User1' }];
            db.all.mockImplementationOnce((query, params, callback) => callback(null, mockUsers));
            mockTransporter.sendMail.mockRejectedValueOnce(new Error('Email error'));

            alertUserWishlist(101, 9.99, (err, message) => {
                expect(err).toEqual(new Error('Failed to send some emails.'));
                expect(message).toBeUndefined();
                done();
            });
        });
    });
});
