const mongoose = require('mongoose');
const { MongoMemoryReplSet } = require('mongodb-memory-server');

let replSet;

/**
 * Connect to an in-memory MongoDB **Replica Set**.
 * A replica set is required because routes/sales.js and routes/returns.js
 * use Mongoose transactions (session.startTransaction), which only work
 * on replica set members or mongos — not standalone instances.
 *
 * Used in beforeAll() of each test suite.
 */
const connect = async () => {
  replSet = await MongoMemoryReplSet.create({
    replSet: { count: 1, storageEngine: 'wiredTiger' }
  });
  const uri = replSet.getUri();
  await mongoose.connect(uri);
};

/**
 * Drop all collections data.
 * Used in afterEach() of each test suite for isolation.
 */
const clearDatabase = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
};

/**
 * Disconnect mongoose and stop the in-memory replica set.
 * Used in afterAll() of each test suite to prevent open handles.
 */
const closeDatabase = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  if (replSet) {
    await replSet.stop();
  }
};

module.exports = { connect, clearDatabase, closeDatabase };
