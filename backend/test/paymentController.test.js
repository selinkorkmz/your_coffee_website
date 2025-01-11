const { sendInvoiceEmail, getOrderPaymentStatus, pay } = require('../controllers/paymentController');
const db = require('../models/database');
const nodemailer = require('nodemailer');
const { generateInvoicePDF } = require('../utils/invoiceGenerator');

jest.mock('../models/database');
jest.mock('nodemailer');
jest.mock('../utils/invoiceGenerator');

describe('Payment Controller Tests', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('sendInvoiceEmail', () => {
        it('should send an email with the invoice', (done) => {
            const userId = 1;
            const pdfPath = 'invoice-1.pdf';

            db.get.mockImplementationOnce((query, params, callback) => {
                callback(null, { email: 'test@example.com' });
            });

            const sendMailMock = jest.fn((options, callback) => callback(null, { response: 'Email sent' }));
            nodemailer.createTransport.mockReturnValue({ sendMail: sendMailMock });

            sendInvoiceEmail(userId, pdfPath, (err) => {
                expect(err).toBeNull();
                expect(nodemailer.createTransport).toHaveBeenCalled();
                expect(sendMailMock).toHaveBeenCalledWith(
                    expect.objectContaining({
                        to: 'test@example.com',
                        attachments: expect.any(Array)
                    }),
                    expect.any(Function)
                );
                done();
            });
        });

        it('should return an error if the user email is not found', (done) => {
            const userId = 1;
            const pdfPath = 'invoice-1.pdf';

            db.get.mockImplementationOnce((query, params, callback) => {
                callback(null, null);
            });

            sendInvoiceEmail(userId, pdfPath, (err) => {
                expect(err).toEqual(new Error('User email not found.'));
                done();
            });
        });

        it('should return an error if nodemailer fails to send email', (done) => {
            const userId = 1;
            const pdfPath = 'invoice-1.pdf';

            db.get.mockImplementationOnce((query, params, callback) => {
                callback(null, { email: 'test@example.com' });
            });

            const sendMailMock = jest.fn((options, callback) => callback(new Error('SMTP error')));
            nodemailer.createTransport.mockReturnValue({ sendMail: sendMailMock });

            sendInvoiceEmail(userId, pdfPath, (err) => {
                expect(err).toEqual(new Error('Failed to send invoice email: SMTP error'));
                done();
            });
        });
    });

    describe('getOrderPaymentStatus', () => {
        it('should return the payment status of an order', (done) => {
            const orderId = 1;

            db.get.mockImplementationOnce((query, params, callback) => {
                callback(null, { payment_status: 'Completed' });
            });

            getOrderPaymentStatus(orderId, (err, status) => {
                expect(err).toBeNull();
                expect(status).toBe('Completed');
                done();
            });
        });

        it('should return "Order not found" if the order does not exist', (done) => {
            const orderId = 1;

            db.get.mockImplementationOnce((query, params, callback) => {
                callback(null, null);
            });

            getOrderPaymentStatus(orderId, (err, status) => {
                expect(err).toBeNull();
                expect(status).toBe('Order not found.');
                done();
            });
        });

        it('should handle database errors gracefully', (done) => {
            const orderId = 1;

            db.get.mockImplementationOnce((query, params, callback) => {
                callback(new Error('Database error'), null);
            });

            getOrderPaymentStatus(orderId, (err, status) => {
                expect(err).toEqual(new Error('Database error'));
                expect(status).toBeUndefined();
                done();
            });
        });
    });

    describe('pay', () => {
        it('should process payment and generate an invoice successfully', (done) => {
            const userId = 1;
            const cardDetails = { cardNumber: '1234123412341234', cvv: '123' };
            const deliveryAddress = '123 Coffee Street';
            const mockCartItems = [
                { product_id: 1, price: 10, quantity: 2, discounted_price: null },
                { product_id: 2, price: 20, quantity: 1, discounted_price: 15 },
            ];
            const mockPDFPath = 'invoice-1.pdf';

            db.all.mockImplementationOnce((query, params, callback) => {
                callback(null, mockCartItems);
            });

            db.run.mockImplementation((query, params, callback) => {
                callback.call({ lastID: 101 }, null);
            });

            generateInvoicePDF.mockImplementation((userId, totalPrice, cartItems, orderDate, orderId, callback) => {
                callback(null, mockPDFPath);
            });

            pay(userId, cardDetails, deliveryAddress, (err, result) => {
                expect(err).toBeNull();
                expect(result).toEqual({
                    message: 'Payment confirmed, order created, and cart cleared.',
                    invoiceFileName: 'invoice-1.pdf',
                });
                done();
            });
        });

        it('should return an error if the cart is empty', (done) => {
            const userId = 1;
            const cardDetails = { cardNumber: '1234123412341234', cvv: '123' };
            const deliveryAddress = '123 Coffee Street';

            db.all.mockImplementationOnce((query, params, callback) => {
                callback(null, []);
            });

            pay(userId, cardDetails, deliveryAddress, (err, result) => {
                expect(err).toEqual(new Error('Cart is empty.'));
                expect(result).toBeUndefined();
                done();
            });
        });

        it('should return an error for invalid card details', (done) => {
            const userId = 1;
            const invalidCardDetails = { cardNumber: 'abcd', cvv: '12' };
            const deliveryAddress = '123 Coffee Street';

            pay(userId, invalidCardDetails, deliveryAddress, (err, result) => {
                expect(err).toEqual(new Error('Invalid card details.'));
                expect(result).toBeUndefined();
                done();
            });
        });

        it('should return an error if the invoice generation fails', (done) => {
            const userId = 1;
            const cardDetails = { cardNumber: '1234123412341234', cvv: '123' };
            const deliveryAddress = '123 Coffee Street';
            const mockCartItems = [{ product_id: 1, price: 10, quantity: 2, discounted_price: null }];

            db.all.mockImplementationOnce((query, params, callback) => {
                callback(null, mockCartItems);
            });

            db.run.mockImplementation((query, params, callback) => {
                callback.call({ lastID: 101 }, null);
            });

            generateInvoicePDF.mockImplementation((userId, totalPrice, cartItems, orderDate, orderId, callback) => {
                callback(new Error('PDF generation error'));
            });

            pay(userId, cardDetails, deliveryAddress, (err, result) => {
                expect(err).toEqual(new Error('PDF generation error'));
                expect(result).toBeUndefined();
                done();
            });
        });
    });
});
