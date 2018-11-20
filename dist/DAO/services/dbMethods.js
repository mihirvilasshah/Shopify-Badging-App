"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const ObjectID = require('mongodb').ObjectID;
function getbadges(badges) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield resultBadges(badges);
            function resultBadges(badge) {
                return __awaiter(this, void 0, void 0, function* () {
                    return new Promise((resolve, reject) => {
                        badge
                            .find({}, { projection: { imageSource: 1, thumbnailSource: 1 } })
                            .toArray((error, results) => {
                            if (error)
                                throw error;
                            resolve(results);
                        });
                    });
                });
            }
            return result;
        }
        catch (e) {
            throw e;
        }
    });
}
exports.getbadges = getbadges;
//# sourceMappingURL=../../../src/dist/DAO/services/dbMethods.js.map