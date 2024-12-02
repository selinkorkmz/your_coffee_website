const sqlite3 = require('sqlite3');

const mockDB = {
    run: jest.fn((query, params, callback) => callback && callback(null)),
    get: jest.fn((query, params, callback) => callback && callback(null)),
    all: jest.fn((query, params, callback) => callback && callback(null)),
};

const mockedDatabase = new sqlite3.Database(':memory:');
mockedDatabase.run = mockDB.run;
mockedDatabase.get = mockDB.get;
mockedDatabase.all = mockDB.all;

module.exports = mockedDatabase;