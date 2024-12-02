const { sendInvoiceEmail, getOrderPaymentStatus, pay } = require('../controllers/paymentController');
const db = require('../models/database');
const nodemailer = require('nodemailer');
const { generateInvoicePDF } = require('../utils/invoiceGenerator');

jest.mock('../models/database');
jest.mock('nodemailer');
jest.mock('../utils/invoiceGenerator');

describe('Payment Controller Tests', () => {
    describe('sendInvoiceEmail', () => {
        it('should send an email with the invoice', (done) => {
            const userId = 1;
            const pdfPath = 'invoice-1.pdf';

            // Mock database response for user email
            db.get.mockImplementationOnce((query, params, callback) => {
                callback(null, { email: 'test@example.com' });
            });

            // Mock nodemailer behavior
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
                callback(null, null); // No user found
            });

            sendInvoiceEmail(userId, pdfPath, (err) => {
                expect(err).toEqual(new Error('User email not found.'));
                done();
            });
        });
    });

    
    describe('getOrderPaymentStatus', () => {
        it('should return the payment status of an order', (done) => {
            const orderId = 1;

            db.get.mockImplementationOnce((query, params, callback) => {
                callback(null, { payment_status: 'Completed' }); // Mock payment status
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
                callback(null, null); // Order not found
            });

            getOrderPaymentStatus(orderId, (err, status) => {
                expect(err).toBeNull();
                expect(status).toBe('Order not found.');
                done();
            });
        });
    });
});