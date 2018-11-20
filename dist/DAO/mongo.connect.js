var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const MongoClient = require('mongodb').MongoClient;
const uri = 'mongodb://localhost:27017/';
let _db;
const connectDB = (callback) => __awaiter(this, void 0, void 0, function* () {
    try {
        MongoClient.connect(uri, (err, db) => {
            _db = db;
            return callback(err);
        });
    }
    catch (err) {
        throw err;
    }
});
const getDB = () => _db;
const disconnectDB = () => _db.close();
module.exports = { connectDB, getDB, disconnectDB };
//# sourceMappingURL=../../src/dist/DAO/mongo.connect.js.map