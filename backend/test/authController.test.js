const {
    registerUser,
    signInUser,
    getAllUsers,
    getUserByEmail,
    updateUser,
    getUserProfile,
    updateUserAddressandTaxid,
} = require('../controllers/authController');
const db = require('../models/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('../models/database');

describe('Auth Controller Tests', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('registerUser', () => {
        it('should register a new user successfully', async () => {
            const mockCallback = jest.fn();

            db.get.mockImplementation((query, params, callback) => callback(null, null)); // No user found
            bcrypt.hash.mockResolvedValue('hashedPassword');
            db.run.mockImplementation((query, params, callback) => callback.call({ lastID: 1 }, null));

            await registerUser('Test User', 'test@example.com', 'password123', 'user', '12345', '123 Main St', mockCallback);

            expect(db.get).toHaveBeenCalled();
            expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
            expect(db.run).toHaveBeenCalled();
            expect(mockCallback).toHaveBeenCalledWith(null, { userId: 1 });
        });

        it('should not register a user if the email is already in use', async () => {
            const mockCallback = jest.fn();

            db.get.mockImplementation((query, params, callback) =>
                callback(null, { email: 'test@example.com' })
            );

            await registerUser('Test User', 'test@example.com', 'password123', 'user', '12345', '123 Main St', mockCallback);

            expect(mockCallback).toHaveBeenCalledWith(new Error('Email already in use. Please use a different email.'));
        });

        it('should handle database errors during email check', async () => {
            const mockCallback = jest.fn();

            db.get.mockImplementation((query, params, callback) => callback(new Error('Database error')));

            await registerUser('Test User', 'test@example.com', 'password123', 'user', '12345', '123 Main St', mockCallback);

            expect(mockCallback).toHaveBeenCalledWith(new Error('Database error'));
        });
    });

    describe('signInUser', () => {
        it('should sign in a user successfully', async () => {
            const mockCallback = jest.fn();

            db.get.mockImplementation((query, params, callback) =>
                callback(null, { user_id: 1, email: 'test@example.com', password: 'hashedPassword', role: 'user' })
            );
            bcrypt.compare.mockResolvedValue(true);
            jwt.sign.mockReturnValue('mockToken');

            await signInUser('test@example.com', 'password123', mockCallback);

            expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');
            expect(jwt.sign).toHaveBeenCalledWith({ userId: 1, role: 'user' }, 'your-secret-key', { expiresIn: '888888h' });
            expect(mockCallback).toHaveBeenCalledWith(null, { token: 'mockToken', user: expect.any(Object) });
        });

        it('should return an error for incorrect password', async () => {
            const mockCallback = jest.fn();

            db.get.mockImplementation((query, params, callback) =>
                callback(null, { user_id: 1, email: 'test@example.com', password: 'hashedPassword' })
            );
            bcrypt.compare.mockResolvedValue(false);

            await signInUser('test@example.com', 'wrongpassword', mockCallback);

            expect(mockCallback).toHaveBeenCalledWith(new Error('Invalid email or password.'));
        });

        it('should return an error if the user does not exist', async () => {
            const mockCallback = jest.fn();

            db.get.mockImplementation((query, params, callback) => callback(null, null));

            await signInUser('nonexistent@example.com', 'password123', mockCallback);

            expect(mockCallback).toHaveBeenCalledWith(new Error('Invalid email or password.'));
        });
    });

    describe('getAllUsers', () => {
        it('should return all users successfully', async () => {
            const mockCallback = jest.fn();

            const mockUsers = [
                { user_id: 1, name: 'User 1', email: 'user1@example.com' },
                { user_id: 2, name: 'User 2', email: 'user2@example.com' },
            ];

            db.all.mockImplementation((query, params, callback) => callback(null, mockUsers));

            await getAllUsers(mockCallback);

            expect(db.all).toHaveBeenCalled();
            expect(mockCallback).toHaveBeenCalledWith(null, mockUsers);
        });

        it('should return an error if database query fails', async () => {
            const mockCallback = jest.fn();

            db.all.mockImplementation((query, params, callback) => callback(new Error('Database error')));

            await getAllUsers(mockCallback);

            expect(mockCallback).toHaveBeenCalledWith(new Error('Database error'));
        });
    });

    describe('getUserByEmail', () => {
        it('should return user details for a valid email', async () => {
            const mockCallback = jest.fn();

            const mockUser = { user_id: 1, name: 'Test User', email: 'test@example.com' };

            db.get.mockImplementation((query, params, callback) => callback(null, mockUser));

            await getUserByEmail('test@example.com', mockCallback);

            expect(db.get).toHaveBeenCalled();
            expect(mockCallback).toHaveBeenCalledWith(null, mockUser);
        });

        it('should return an error for a non-existent email', async () => {
            const mockCallback = jest.fn();

            db.get.mockImplementation((query, params, callback) => callback(null, null));

            await getUserByEmail('nonexistent@example.com', mockCallback);

            expect(mockCallback).toHaveBeenCalledWith(new Error('User not found'));
        });
    });

    describe('updateUser', () => {
        it('should update user information successfully', async () => {
            const mockCallback = jest.fn();

            db.get.mockImplementation((query, params, callback) => callback(null, null)); // No duplicate email
            bcrypt.hash.mockResolvedValue('hashedPassword');
            db.run.mockImplementation((query, params, callback) => callback(null));

            await updateUser(1, 'Updated User', 'updated@example.com', 'newPassword123', mockCallback);

            expect(bcrypt.hash).toHaveBeenCalledWith('newPassword123', 10);
            expect(db.run).toHaveBeenCalled();
            expect(mockCallback).toHaveBeenCalledWith(null, 'User information updated successfully.');
        });

        it('should return an error if the email is already in use', async () => {
            const mockCallback = jest.fn();

            db.get.mockImplementation((query, params, callback) =>
                callback(null, { user_id: 2, email: 'duplicate@example.com' })
            );

            await updateUser(1, 'Updated User', 'duplicate@example.com', 'newPassword123', mockCallback);

            expect(mockCallback).toHaveBeenCalledWith(new Error('Email already in use by another user.'));
        });
    });

    describe('getUserProfile', () => {
        it('should return user profile successfully', async () => {
            const mockCallback = jest.fn();

            const mockProfile = { user_id: 1, name: 'Test User', email: 'test@example.com', role: 'user' };

            db.get.mockImplementation((query, params, callback) => callback(null, mockProfile));

            await getUserProfile(1, mockCallback);

            expect(db.get).toHaveBeenCalledWith(expect.any(String), [1], expect.any(Function));
            expect(mockCallback).toHaveBeenCalledWith(null, mockProfile);
        });

        it('should return an error if the user does not exist', async () => {
            const mockCallback = jest.fn();

            db.get.mockImplementation((query, params, callback) => callback(null, null));

            await getUserProfile(999, mockCallback);

            expect(mockCallback).toHaveBeenCalledWith(new Error('User not found'));
        });
    });

    describe('updateUserAddressandTaxid', () => {
        it('should update home address and tax ID successfully', (done) => {
            db.run.mockImplementation((query, params, callback) => callback(null));

            updateUserAddressandTaxid(1, '123 Updated Address', '67890', (err, result) => {
                expect(err).toBeNull();
                expect(result).toEqual({ message: 'User details updated successfully.' });
                done();
            });
        });

        it('should return an error if no changes were made', (done) => {
            db.run.mockImplementation((query, params, callback) => callback(null, { changes: 0 }));

            updateUserAddressandTaxid(1, '123 Updated Address', '67890', (err, result) => {
                expect(err).toEqual(new Error('User not found or no changes made.'));
                expect(result).toBeUndefined();
                done();
            });
        });
    });
});
