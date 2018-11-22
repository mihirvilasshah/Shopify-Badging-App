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
const mongodb_1 = require("mongodb");
// const forwardingAddress = 'https://dc7a4f9d.ngrok.io';
const url = 'mongodb://localhost:27017/';
const badgeDB = 'tricon-jewel-store';
const shop = 'tricon-jewel-store.myshopify.com';
const shopName = 'tricon-jewel-store.myshopify.com';
function getSrc(req, res) {
    mongodb_1.MongoClient.connect(url, { useNewUrlParser: true }, (err, db) => {
        if (err)
            throw err;
        console.log('check', db);
        const dbo = db.db(badgeDB);
        const myquery = { id: parseInt(req.params.pid) };
        console.log('id: ' + req.params.pid);
        dbo.collection(shop).findOne(myquery, (error, obj) => {
            if (error)
                throw error;
            let aid;
            aid = obj;
            //  res.send(obj.ABid);
            //  console.log('product found: ' + Aid);
            if (aid) {
                res.send(aid);
            }
        });
    });
}
exports.getSrc = getSrc;
function getbadges(req, res) {
    console.log('body: ', req.body.src);
    const pagesrc = req.body.src;
    let flag;
    function srcs(pagesrcs) {
        return __awaiter(this, void 0, void 0, function* () {
            const prod = [];
            for (let i = 0; i < pagesrcs.length; i++) {
                const s = pagesrcs[i].split('=');
                const src = 'https:' + s[0] + s[1];
                // console.log(src);
                const myquery = {
                    'image.src': new RegExp(s[1], 'i')
                };
                prod[i] = yield findProd(myquery);
                console.log('1st');
                console.log(prod);
            }
            flag = yield loopdone();
            res.send(prod);
        });
    }
    function loopdone() {
        return new Promise((resolve, reject) => {
            resolve('done');
        });
    }
    function findProd(myquery) {
        return new Promise((resolve, reject) => {
            mongodb_1.MongoClient.connect(url, { useNewUrlParser: true }, (err, db) => {
                if (err)
                    throw err;
                const dbo = db.db(badgeDB);
                dbo.collection(shop).findOne(myquery, (error, obj) => {
                    if (error)
                        throw error;
                    resolve(obj);
                });
            });
        });
    }
    srcs(pagesrc);
}
exports.getbadges = getbadges;
//# sourceMappingURL=../../src/dist/controller/addBadge.controller.js.map