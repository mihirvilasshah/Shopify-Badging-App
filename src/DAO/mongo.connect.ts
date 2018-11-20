const MongoClient = require('mongodb').MongoClient;
const uri = 'mongodb://localhost:27017/';
let _db;

const connectDB = async callback => {
  try {
    MongoClient.connect(
      uri,
      (err, db) => {
        _db = db;
        return callback(err);
      }
    );
  } catch (err) {
    throw err;
  }
};

const getDB = () => _db;

const disconnectDB = () => _db.close();

module.exports = { connectDB, getDB, disconnectDB };
