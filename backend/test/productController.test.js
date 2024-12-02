const {
    getProductByField,
    getAllProducts,
    getProductById,
    addProduct,
    getAllCategories,
    searchProducts,
    setDiscountOnProduct
} = require('../controllers/productController');

const db = require('../models/database');
const { getProductReviews } = require('../controllers/reviewController');

jest.mock('../models/database');
jest.mock('../controllers/reviewController');

describe('Product Controller Tests', () => {
    describe('getProductById', () => {
        it('should return a product by its ID', (done) => {
            const productId = 1;
            const mockProduct = { product_id: 1, name: 'Espresso Blend' };

            db.get.mockImplementationOnce((query, params, callback) => {
                expect(query).toContain('SELECT * FROM Products WHERE product_id = ?');
                expect(params).toEqual([productId]);
                callback(null, mockProduct);
            });

            getProductById(productId, (err, product) => {
                expect(err).toBeNull();
                expect(product).toEqual(mockProduct);
                done();
            });
        });

        it('should return an error if the product is not found', (done) => {
            const productId = 999;

            db.get.mockImplementationOnce((query, params, callback) => {
                callback(null, null); // No product found
            });

            getProductById(productId, (err, product) => {
                expect(err).toBeNull();
                expect(product).toBeNull();
                done();
            });
        });
    });

    describe('getAllProducts', () => {
        it('should return all products with ratings', (done) => {
            const mockProducts = [
                { product_id: 1, name: 'Espresso Blend' },
                { product_id: 2, name: 'Drip Coffee Maker' }
            ];
            const mockReviews = [
                [{ rating: 4 }, { rating: 5 }],
                [{ rating: 3 }]
            ];

            db.all.mockImplementationOnce((query, params, callback) => {
                expect(query).toContain('SELECT * FROM Products');
                callback(null, mockProducts);
            });

            getProductReviews.mockResolvedValueOnce(mockReviews[0]);
            getProductReviews.mockResolvedValueOnce(mockReviews[1]);

            getAllProducts((err, products) => {
                expect(err).toBeNull();
                expect(products).toEqual([
                    { ...mockProducts[0], rating: 4.5 },
                    { ...mockProducts[1], rating: 3 }
                ]);
                done();
            });
        });

        it('should handle errors during product retrieval', (done) => {
            db.all.mockImplementationOnce((query, params, callback) => {
                callback(new Error('Database error'), null);
            });

            getAllProducts((err, products) => {
                expect(err).toEqual(new Error('Database error'));
                expect(products).toBeNull();
                done();
            });
        });
    });

    describe('addProduct', () => {
        it('should add a new product and return its ID', (done) => {
            const mockProduct = {
                name: 'New Coffee',
                description: 'Delicious coffee',
                model: 'Model3',
                serial_number: 'SN300',
                price: 10.99,
                discounted_price: 9.99,
                quantity_in_stock: 100,
                warranty_status: '1 year',
                distributor_info: 'CoffeeCo',
                origin: 'Brazil',
                roast_level: 'Dark',
                power_usage: null,
                category: 'Coffee'
            };

            db.run.mockImplementationOnce((query, params, callback) => {
                expect(query).toContain('INSERT INTO Products');
                expect(params).toEqual(Object.values(mockProduct));
                callback.call({ lastID: 3 }, null);
            });

            addProduct(mockProduct, (err, result) => {
                expect(err).toBeNull();
                expect(result).toEqual({ productId: 3 });
                done();
            });
        });

        it('should return an error if the product cannot be added', (done) => {
            const mockProduct = { name: 'New Coffee' };

            db.run.mockImplementationOnce((query, params, callback) => {
                callback(new Error('Insertion failed'));
            });

            addProduct(mockProduct, (err, result) => {
                expect(err).toEqual(new Error('Insertion failed'));
                expect(result).toBeNull();
                done();
            });
        });
    });

    describe('setDiscountOnProduct', () => {
        it('should apply a discount to a product', (done) => {
            const productId = 1;
            const discountRate = 0.2; // 20% discount
            const mockProduct = { product_id: productId, price: 100 };

            db.get.mockImplementationOnce((query, params, callback) => {
                expect(query).toContain('SELECT * FROM Products WHERE product_id = ?');
                expect(params).toEqual([productId]);
                callback(null, mockProduct);
            });

            db.run.mockImplementationOnce((query, params, callback) => {
                expect(query).toContain('UPDATE Products SET discounted_price = ?');
                expect(params).toEqual([80, productId]); // New price = 100 * (1 - 0.2)
                callback(null);
            });

            setDiscountOnProduct(productId, discountRate, (err, result) => {
                expect(err).toBeNull();
                expect(result).toEqual({ productId, newPrice: 80 });
                done();
            });
        });

        it('should return an error for an invalid discount rate', (done) => {
            const productId = 1;
            const invalidRate = 1.5;

            setDiscountOnProduct(productId, invalidRate, (err, result) => {
                expect(err).toEqual(new Error('Invalid discount rate'));
                expect(result).toBeNull();
                done();
            });
        });
    });

    describe('getAllCategories', () => {
        it('should return all unique product categories', (done) => {
            const mockCategories = [{ category: 'Coffee' }, { category: 'Coffee Machine' }];

            db.all.mockImplementationOnce((query, params, callback) => {
                expect(query).toContain('SELECT DISTINCT category FROM Products');
                callback(null, mockCategories);
            });

            getAllCategories((err, categories) => {
                expect(err).toBeNull();
                expect(categories).toEqual(['Coffee', 'Coffee Machine']);
                done();
            });
        });

        it('should return an error if fetching categories fails', (done) => {
            db.all.mockImplementationOnce((query, params, callback) => {
                callback(new Error('Database error'), null);
            });

            getAllCategories((err, categories) => {
                expect(err).toEqual(new Error('Database error'));
                expect(categories).toBeNull();
                done();
            });
        });
    });

    describe('searchProducts', () => {
        it('should return products matching the search term', (done) => {
            const searchTerm = 'coffee';
            const mockProducts = [{ name: 'Coffee A' }, { name: 'Coffee B' }];

            db.all.mockImplementationOnce((query, params, callback) => {
                expect(query).toContain('WHERE name LIKE ?');
                expect(params).toEqual(['%coffee%', '%coffee%', '%coffee%', '%coffee%']);
                callback(null, mockProducts);
            });

            searchProducts(searchTerm, (err, products) => {
                expect(err).toBeNull();
                expect(products).toEqual(mockProducts);
                done();
            });
        });
    });

});