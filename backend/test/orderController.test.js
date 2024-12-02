const {
    getOrderDetails,
    getAllOrdersByUserId,
    updateOrderStatus,
    cancelOrder,
    processReturn
} = require('../controllers/orderController');
const db = require('../models/database');

jest.mock('../models/database');

describe('Order Controller Tests', () => {
    describe('getOrderDetails', () => {
        it('should retrieve order details with items', (done) => {
            const orderId = 1;

            // Mock order query
            db.get.mockImplementationOnce((query, params, callback) => {
                callback(null, { order_id: orderId, order_status: 'Processing' });
            });

            // Mock order items query
            db.all.mockImplementationOnce((query, params, callback) => {
                callback(null, [{ product_id: 101, quantity: 2 }]);
            });

            getOrderDetails(orderId, (err, order) => {
                expect(err).toBeNull();
                expect(order).toEqual({
                    order_id: orderId,
                    order_status: 'Processing',
                    orderItems: [{ product_id: 101, quantity: 2 }]
                });
                done();
            });
        });

        it('should return an error if the order is not found', (done) => {
            const orderId = 99;

            db.get.mockImplementationOnce((query, params, callback) => {
                callback(null, null); // No order found
            });

            getOrderDetails(orderId, (err, order) => {
                expect(err).toEqual(new Error('Order not found.'));
                expect(order).toBeUndefined();
                done();
            });
        });

        it('should return an error if order items are not found', (done) => {
            const orderId = 1;

            db.get.mockImplementationOnce((query, params, callback) => {
                callback(null, { order_id: orderId });
            });

            db.all.mockImplementationOnce((query, params, callback) => {
                callback(null, []); // No order items found
            });

            getOrderDetails(orderId, (err, order) => {
                expect(err).toEqual(new Error('Order items not found.'));
                expect(order).toBeUndefined();
                done();
            });
        });
    });

    describe('getAllOrdersByUserId', () => {
        it('should retrieve all orders for a user grouped by order ID', (done) => {
            const userId = 1;

            const mockRows = [
                { order_id: 1, product_id: 101, product_name: 'Product A', quantity: 2 },
                { order_id: 2, product_id: 102, product_name: 'Product B', quantity: 1 }
            ];

            db.all.mockImplementationOnce((query, params, callback) => {
                callback(null, mockRows);
            });

            getAllOrdersByUserId(userId, (err, orders) => {
                expect(err).toBeNull();
                expect(orders.length).toBe(2);
                expect(orders[0].order_items.length).toBe(1);
                done();
            });
        });

        it('should return an empty array if no orders are found', (done) => {
            const userId = 1;

            db.all.mockImplementationOnce((query, params, callback) => {
                callback(null, []);
            });

            getAllOrdersByUserId(userId, (err, orders) => {
                expect(err).toBeNull();
                expect(orders).toEqual([]);
                done();
            });
        });
    });

    describe('updateOrderStatus', () => {
        it('should update order status successfully', (done) => {
            const orderId = 1;
            const status = 'Delivered';

            db.run.mockImplementationOnce((query, params, callback) => {
                callback(null); // Success
            });

            updateOrderStatus(orderId, status, (err, message) => {
                expect(err).toBeNull();
                expect(message).toBe(`Order status updated to ${status}.`);
                done();
            });
        });

        it('should return an error for an invalid status', (done) => {
            const orderId = 1;
            const status = 'InvalidStatus';

            updateOrderStatus(orderId, status, (err, message) => {
                expect(err).toEqual(new Error('Invalid status provided.'));
                expect(message).toBeUndefined();
                done();
            });
        });
    });

    describe('cancelOrder', () => {
        it('should cancel an order and restore stock', (done) => {
            const orderId = 1;

            db.get.mockImplementationOnce((query, params, callback) => {
                callback(null, { order_id: orderId, order_status: 'Processing' });
            });

            db.run.mockImplementation((query, params, callback) => callback(null)); // For both cancel order and update stock
            db.all.mockImplementationOnce((query, params, callback) => {
                callback(null, [{ product_id: 101, quantity: 2 }]); // Mock order items
            });

            cancelOrder(orderId, (err, result) => {
                expect(err).toBeNull();
                expect(result).toEqual({ message: 'Order successfully canceled and stock restored.' });
                done();
            });
        });

        it('should return an error if the order is already delivered', (done) => {
            const orderId = 1;

            db.get.mockImplementationOnce((query, params, callback) => {
                callback(null, { order_id: orderId, order_status: 'Delivered' });
            });

            cancelOrder(orderId, (err, result) => {
                expect(err).toEqual(new Error('Cannot cancel this order as it is already delivered or returned.'));
                expect(result).toBeUndefined();
                done();
            });
        });
    });

    describe('processReturn', () => {
        it('should process a return and restore stock', (done) => {
            const orderId = 1;

            db.get.mockImplementationOnce((query, params, callback) => {
                callback(null, { order_id: orderId, order_status: 'Delivered', payment_status: 'Completed' });
            });

            db.run.mockImplementation((query, params, callback) => callback(null)); // For update status and stock
            db.all.mockImplementationOnce((query, params, callback) => {
                callback(null, [{ product_id: 101, quantity: 2 }]); // Mock order items
            });

            processReturn(orderId, (err, result) => {
                expect(err).toBeNull();
                expect(result).toEqual({ message: 'Return processed successfully. Stock restored.' });
                done();
            });
        });

        it('should return an error if the order is not eligible for return', (done) => {
            const orderId = 1;

            db.get.mockImplementationOnce((query, params, callback) => {
                callback(null, { order_id: orderId, order_status: 'Processing' });
            });

            processReturn(orderId, (err, result) => {
                expect(err).toEqual(new Error('This order cannot be returned because it is not delivered or in-transit.'));
                expect(result).toBeUndefined();
                done();
            });
        });
    });
});
