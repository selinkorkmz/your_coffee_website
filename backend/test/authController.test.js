// authController.test.js
const { registerUser, signInUser, getAllUsers, getUserByEmail, updateUser, getUserProfile } = require('../controllers/authController');
const db = require('../models/database'); // Mock this
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('../models/database');

describe('Auth Controller Tests', () => {
    describe('registerUser', () => {
        it('should register a new user successfully', async () => {
            const mockCallback = jest.fn();

            // Mock database and bcrypt behavior
            db.get.mockImplementation((query, params, callback) => callback(null, null));
            bcrypt.hash.mockResolvedValue('hashedPassword');
            db.run.mockImplementation((query, params, callback) => callback(null));

            await registerUser('Test User', 'test@example.com', 'password123', 'user', mockCallback);

            expect(db.get).toHaveBeenCalled();
            expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
            expect(db.run).toHaveBeenCalled();
            expect(mockCallback).toHaveBeenCalledWith(null, { userId: undefined });
        });

        it('should not register a user if email is already in use', async () => {
            const mockCallback = jest.fn();

            // Mock email in use
            db.get.mockImplementation((query, params, callback) => callback(null, { email: 'test@example.com' }));

            await registerUser('Test User', 'test@example.com', 'password123', 'user', mockCallback);

            expect(mockCallback).toHaveBeenCalledWith(new Error('Email already in use. Please use a different email.'));
        });
    });

    describe('signInUser', () => {
        it('should sign in a user successfully', async () => {
            const mockCallback = jest.fn();

            // Mock database and bcrypt behavior
            db.get.mockImplementation((query, params, callback) =>
                callback(null, { email: 'test@example.com', password: 'hashedPassword', user_id: 1, role: 'user' })
            );
            bcrypt.compare.mockResolvedValue(true);
            jwt.sign.mockReturnValue('mockToken');

            await signInUser('test@example.com', 'password123', mockCallback);

            expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');
            expect(jwt.sign).toHaveBeenCalledWith({ userId: 1, role: 'user' }, 'your-secret-key', { expiresIn: '888888h' });
            expect(mockCallback).toHaveBeenCalledWith(null, { token: 'mockToken', user: expect.any(Object) });
        });

        it('should return error for invalid email or password', async () => {
            const mockCallback = jest.fn();

            // Mock user not found
            db.get.mockImplementation((query, params, callback) => callback(null, null));

            await signInUser('invalid@example.com', 'password123', mockCallback);

            expect(mockCallback).toHaveBeenCalledWith(new Error('Invalid email or password.'));
        });
    });

    describe('getAllUsers', () => {
        it('should return all users', async () => {
            const mockCallback = jest.fn();

            db.all.mockImplementation((query, params, callback) => callback(null, [{ user_id: 1, name: 'Test User' }]));

            await getAllUsers(mockCallback);

            expect(db.all).toHaveBeenCalled();
            expect(mockCallback).toHaveBeenCalledWith(null, [{ user_id: 1, name: 'Test User' }]);
        });
    });

    describe('getUserByEmail', () => {
        it('should return user by email', async () => {
            const mockCallback = jest.fn();

            db.get.mockImplementation((query, params, callback) =>
                callback(null, { user_id: 1, name: 'Test User', email: 'test@example.com' })
            );

            await getUserByEmail('test@example.com', mockCallback);

            expect(db.get).toHaveBeenCalled();
            expect(mockCallback).toHaveBeenCalledWith(null, expect.any(Object));
        });

        it('should return error if user is not found', async () => {
            const mockCallback = jest.fn();

            db.get.mockImplementation((query, params, callback) => callback(null, null));

            await getUserByEmail('nonexistent@example.com', mockCallback);

            expect(mockCallback).toHaveBeenCalledWith(new Error('User not found'));
        });
    });

    describe('updateUser', () => {
        it('should update user information successfully', async () => {
            const mockCallback = jest.fn();

            db.get.mockImplementation((query, params, callback) => callback(null, null));
            bcrypt.hash.mockResolvedValue('hashedPassword');
            db.run.mockImplementation((query, params, callback) => callback(null));

            await updateUser(1, 'Updated User', 'updated@example.com', 'newPassword123', mockCallback);

            expect(bcrypt.hash).toHaveBeenCalledWith('newPassword123', 10);
            expect(db.run).toHaveBeenCalled();
            expect(mockCallback).toHaveBeenCalledWith(null, 'User information updated successfully.');
        });
    });

    describe('getUserProfile', () => {
        it('should return user profile successfully', async () => {
            const mockCallback = jest.fn();

            db.get.mockImplementation((query, params, callback) =>
                callback(null, { user_id: 1, name: 'Test User', email: 'test@example.com' })
            );

            await getUserProfile(1, mockCallback);

            expect(db.get).toHaveBeenCalledWith(expect.any(String), [1], expect.any(Function));
            expect(mockCallback).toHaveBeenCalledWith(null, expect.any(Object));
        });
    });
});