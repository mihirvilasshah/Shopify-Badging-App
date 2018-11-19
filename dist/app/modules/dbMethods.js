var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const ObjectID = require('mongodb').ObjectID;
const getbadges = (badges) => __awaiter(this, void 0, void 0, function* () {
    try {
        const result = yield badges
            .find({}, { projection: { imageSource: 1, thumbnailSource: 1 } })
            .toArray((error, results) => {
            if (error)
                throw error;
            // res.setHeader('content-type', results.contentType);
            const obj = [];
            for (let i = 0; i < results.length; i++) {
                obj[i] = {
                    _id: results[i]._id,
                    imageSource: results[i].imageSource,
                    thumbnailSource: results[i].thumbnailSource,
                    default: false
                };
            }
            console.log(obj);
            return obj;
        });
    }
    catch (e) {
        throw e;
    }
});
module.exports = { getbadges };
//# sourceMappingURL=../../../src/dist/app/modules/dbMethods.js.map