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

});