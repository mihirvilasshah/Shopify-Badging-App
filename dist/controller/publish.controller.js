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
const compressImages = require('compress-images');
const crypto = require('crypto');
const fse = require('fs-extra');
const http = require('http');
const ObjectId = require('mongodb').ObjectId;
const nonce = require('nonce')();
const querystring = require('querystring');
const reqPromise = require('request-promise');
const mongoDB = require('../DAO/mongo.connect');
const dbmethods = require('../DAO/services/dbMethods');
// const forwardingAddress = 'https://dc7a4f9d.ngrok.io';
const url = 'mongodb://localhost:27017/';
let badgeDB = 'tricon-jewel-store';
const shop = 'tricon-jewel-store.myshopify.com';
const shopName = 'tricon-jewel-store.myshopify.com';
function publishBadges(req, res) {
    const map = 0;
    console.log('body: ' + JSON.stringify(req.body));
    console.log(req.body.bid);
    res.send(req.body);
    mongodb_1.MongoClient.connect(url, { useNewUrlParser: true }, (err, db) => {
        if (err)
            throw err;
        badgeDB = req.params.shopname;
        const dbo = db.db(badgeDB);
        let collection = '';
        collection = req.body.default ? 'Library_Badges_Default' : 'badges';
        const query = {
            _id: ObjectId(req.body.bid)
        };
        console.log(query);
        let imgsrc;
        let thumbnailSrc;
        dbo.collection(collection).findOne(query, (error, obj) => {
            if (error)
                throw error;
            console.log('published: ');
            console.log(obj);
            imgsrc = obj.imageSource;
            thumbnailSrc = obj.thumbnailSource;
            const newoid = ObjectId();
            const newvalues = {
                $push: {
                    badge: {
                        abid: newoid,
                        Bid: req.body.bid,
                        left: req.body.xvalue,
                        top: req.body.yvalue,
                        opvalue: req.body.opval,
                        width: req.body.width,
                        height: req.body.height,
                        borderRadius: req.body.borderRadius,
                        imageSource: imgsrc,
                        thumbnailSource: thumbnailSrc
                    }
                }
            };
            for (let i = 0; i < req.body.pid.length; i++) {
                const myquery = {
                    _id: ObjectId(req.body.pid[i])
                };
                console.log('pids: ' + req.body.pid[i]);
                if (i === 0 ||
                    req.body.pid[i] !== req.body.pid[i - 1] ||
                    req.body.filter !== 'Price') {
                    dbo
                        .collection(shop)
                        .updateOne(myquery, newvalues, (errors, objct) => {
                        if (errors)
                            throw errors;
                        console.log('product updated abid: ' + objct);
                    });
                }
                if (req.body.filter === 'Price') {
                    const v = parseFloat(req.body.vid[i]);
                    const v1 = req.body.vid[i];
                    const myquery1 = {
                        _id: ObjectId(req.body.pid[i]),
                        'variants.id': v
                    };
                    const newvalues1 = { $push: { 'variants.$.bids': newoid } };
                    console.log('vids: ' + req.body.vid[i]);
                    console.log('v: ' + v);
                    dbo.collection(shop).updateOne(myquery1, {
                        $push: {
                            'variants.$.badge': {
                                abid: newoid,
                                thumbnailSource: req.body.thumbnailSource
                            }
                        }
                    }, (errors, object) => {
                        if (errors)
                            throw errors;
                        console.log('product updated Vid: ' + object);
                        console.log('product updated abid: ' + req.body.bid);
                        console.log('product updated Vid: ' + v);
                        console.log('product updated Vid: ' + req.body.vid.length);
                    });
                }
                else {
                    for (const pd of req.body.pid) {
                        const myquerys = {
                            _id: ObjectId(pd)
                        };
                        console.log(myquerys);
                        dbo.collection(shop).findOne(myquerys, {
                            projection: {
                                'variants.id': 1
                            }
                        }, (dberror, object) => {
                            if (dberror)
                                throw dberror;
                            console.log('letID');
                            console.log(object);
                            for (const ob of object.variants) {
                                const myquery1 = {
                                    'variants.id': ob
                                };
                                const newvalues1 = {
                                    $push: {
                                        'variants.$.bids': req.body.bid
                                    }
                                };
                                dbo.collection(shop).updateOne(myquery1, {
                                    $push: {
                                        'variants.$.badge': {
                                            abid: newoid,
                                            thumbnailSource: req.body.thumbnailSource
                                        }
                                    }
                                }, (updateError, response) => {
                                    if (updateError)
                                        throw updateError;
                                    console.log('product updated Vid: ' + response);
                                    console.log('product updated abid:' + req.body.bid);
                                });
                            }
                        });
                    }
                }
            }
        });
    });
}
exports.publishBadges = publishBadges;
function unpublishBadges(req, res) {
    mongodb_1.MongoClient.connect(url, { useNewUrlParser: true }, (err, db) => {
        if (err)
            throw err;
        badgeDB = req.params.shopname;
        const dbo = db.db(badgeDB);
        console.log('response result');
        console.log(req.body.pid);
        getIds();
        function getIds() {
            return __awaiter(this, void 0, void 0, function* () {
                for (let i = 0; i < req.body.pid.length; i++) {
                    // let newvalues = { $pull: { 'badge': { Bid: req.body.pid[i].bid[j] } } };
                    // bugs possible
                    for (let j = 0; j < req.body.pid[i].bid.length; j++) {
                        console.log(req.body.pid[i].bid[j]);
                        console.log('i' + i);
                        if (req.body.filter === 'Price') {
                            const rem = yield dbRemove(i, j, shop, dbo);
                            console.log('rem', rem);
                            const myquery = {
                                _id: ObjectId(req.body.pid[i].prodid)
                            };
                            let object;
                            object = yield checkAllvariants(ObjectId(req.body.pid[i].bid[j]), myquery, dbo);
                            console.log('deleteBadge', object);
                            const remP = yield removeProdLevel(object, i, j, dbo);
                            console.log('remP', remP);
                        }
                        else {
                            const others = yield other(i, j, dbo);
                            console.log('others', others);
                        }
                    }
                }
            });
        }
    });
    function other(i, j, dbo) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const myquery = {
                    _id: ObjectId(req.body.pid[i].prodid)
                };
                const newvalues = {
                    $pull: { badge: { abid: ObjectId(req.body.pid[i].bid[j]) } }
                };
                console.log(req.body.pid[i].abid[j]);
                dbo.collection(shop).updateOne(myquery, newvalues, (err, obj) => {
                    if (err)
                        throw err;
                    console.log('removed badge from product: ' + obj);
                });
                console.log(myquery);
                dbo.collection(shop).findOne(myquery, {
                    projection: {
                        'variants.id': 1
                    }
                }, (err, obj) => {
                    if (err)
                        throw err;
                    console.log('letID');
                    console.log(obj);
                    console.log('i3' + i);
                    for (let k = 0; k < obj.variants.length; k++) {
                        const myquery2 = {
                            'variants.id': obj.variants[k].id
                        };
                        console.log(myquery2);
                        console.log(j);
                        console.log(i);
                        console.log(k);
                        console.log(shop);
                        console.log(obj.variants.length);
                        dbo.collection(shop).updateOne(myquery2, {
                            $pull: {
                                'variants.$.badge': {
                                    abid: ObjectId(req.body.pid[i].bid[j])
                                }
                            }
                        }, console.log(myquery2), (error, response) => {
                            if (error)
                                throw error;
                            console.log('product updated Vid: ' + response);
                            console.log('product updated Vid: ' + k);
                            console.log(myquery2);
                        });
                    }
                });
                resolve('done others');
            });
        });
    }
    function dbRemove(i, j, globalShop, dbo) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const myquery3 = {
                    'variants.id': parseFloat(req.body.pid[i].vid)
                };
                // let badges = [];
                dbo.collection(globalShop).updateOne(myquery3, {
                    $pull: {
                        'variants.$.badge': {
                            abid: ObjectId(req.body.pid[i].bid[j])
                        }
                    }
                }, console.log(myquery3), (error, resp) => {
                    if (error)
                        throw error;
                    console.log('product updated Vid: ' + resp);
                    console.log(myquery3);
                    // console.log('product updated Bid: ' + req.body.bid);
                    resolve('done removing from letiant');
                });
            });
        });
    }
    function checkAllvariants(abid, myquery, dbo) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                dbo.collection(shop).findOne(myquery, {
                    projection: {
                        'variants.id': 1
                    }
                }, (err, obj) => {
                    if (err)
                        throw err;
                    console.log('letID');
                    console.log(obj);
                    resolve(obj);
                });
            });
        });
    }
    function check(object, abid, k, dbo) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const myquery2 = {
                    'variants.id': object.variants[k].id,
                    'variants.badge.abid': abid // abid - ObjectId('5be0490449f28420b8730375')
                };
                dbo.collection(shop).findOne(myquery2, (error, response) => {
                    if (error)
                        throw error;
                    console.log('product check Vid: ' + response);
                    let deleteBadg = true;
                    // console.log(res);
                    if (response !== undefined) {
                        deleteBadg = false;
                        console.log('DBL:' + deleteBadg);
                        // break;
                    }
                    resolve(deleteBadg);
                });
            });
        });
    }
    function removeProdLevel(deleteBadges, i, j, dbo) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                if (deleteBadges) {
                    const myquery = {
                        _id: ObjectId(req.body.pid[i].prodid)
                    };
                    const newvalues = {
                        $pull: {
                            badge: {
                                abid: ObjectId(req.body.pid[i].bid[j])
                            }
                        }
                    };
                    dbo.collection(shop).updateOne(myquery, newvalues, (err, obj) => {
                        if (err)
                            throw err;
                        console.log(shop);
                        console.log('removed badge from product: ' + obj);
                    });
                    console.log(myquery);
                }
                resolve('done');
            });
        });
    }
}
exports.unpublishBadges = unpublishBadges;
//# sourceMappingURL=../../src/dist/controller/publish.controller.js.map