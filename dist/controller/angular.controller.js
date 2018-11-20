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
const shop = 'Products';
const shopName = 'tricon-jewel-store.myshopify.com';
const mongoClient = require('mongodb').MongoClient;
function getMybadges(req, res) {
    mongoDB.connectDB((err) => __awaiter(this, void 0, void 0, function* () {
        if (err)
            throw err;
        const db = mongoDB.getDB();
        badgeDB = req.params.shopname;
        const dbo = db.db(badgeDB);
        const badges = dbo.collection('badges');
        const badgeresult = yield dbmethods.getbadges(badges);
        console.log(badgeresult);
        res.send(badgeresult);
    }));
}
exports.getMybadges = getMybadges;
function getMyLibrary(req, res) {
    mongoDB.connectDB((err) => __awaiter(this, void 0, void 0, function* () {
        if (err)
            throw err;
        const db = mongoDB.getDB();
        const dbo = db.db('TriconBadgeApp');
        dbo
            .collection('BadgeLibrary')
            .find({}, { projection: { imageSource: 1, thumbnailSource: 1 } })
            .toArray((error, results) => {
            // res.setHeader('content-type', results.contentType);
            const obj = [];
            for (let i = 0; i < results.length; i++) {
                obj[i] = {
                    _id: results[i]._id,
                    imageSource: results[i].imageSource,
                    thumbnailSource: results[i].thumbnailSource,
                    default: true
                };
            }
            res.send(obj);
            console.log(obj);
        });
    }));
}
exports.getMyLibrary = getMyLibrary;
function getPicture(req, res) {
    const filename = req.params.picture;
    mongoDB.connectDB((err) => __awaiter(this, void 0, void 0, function* () {
        const db = mongoDB.getDB();
        if (err)
            throw err;
        const dbname = req.params.shopname;
        const dbo = db.db(dbname);
        dbo
            .collection('badges')
            // perform a mongodb search and return only one result.
            // convert the letiable called filename into a valid objectId.
            .findOne({ _id: ObjectId(filename) }, (error, results) => {
            if (error)
                throw error;
            // set the http response header so the browser knows this
            // is an 'image/jpeg' or 'image/png'
            res.setHeader('content-type', results.contentType);
            // send only the base64 string stored in the img object
            // buffer element
            res.send(results.imageSource);
        });
    }));
}
exports.getPicture = getPicture;
function getProduct(req, res) {
    mongoDB.connectDB((err) => __awaiter(this, void 0, void 0, function* () {
        const db = mongoDB.getDB();
        if (err)
            throw err;
        const dbo = db.db(badgeDB);
        console.log('inside getProd');
        // let myquery = { _id: ObjectId(req.params.id) };
        const myquery = { id: parseInt(req.params.id) };
        // let myquery = { id: 1466289291362 };
        console.log('id: ' + req.params.id);
        dbo.collection(shop).findOne(myquery, (error, obj) => {
            if (error)
                throw error;
            console.log('product found: ' + obj);
            res.send(obj);
        });
        // res.send({ message: 'Found product' });
        db.close();
    }));
}
exports.getProduct = getProduct;
function getIDS(req, res) {
    console.log('inside get IDS');
    mongodb_1.MongoClient.connect(url, { useNewUrlParser: true }, (err, db) => {
        if (err)
            throw err;
        badgeDB = req.params.shopname;
        const dbo = db.db(badgeDB);
        dbo
            .collection('badges')
            .find({ default: true }, { projection: { _id: 1 } })
            .toArray((error, result) => {
            if (error)
                throw error;
            let images;
            images = result;
            //  let ids = result[0];
            const ids = [];
            for (let i = 0; i < images.length; i++) {
                ids[i] = images[i]._id;
            }
            //    console.log(images[0]._id);
            console.log(ids);
            res.send(ids);
            // return ids;
        });
    });
}
exports.getIDS = getIDS;
function getUserIDS(req, res) {
    console.log('inside get User IDS');
    mongodb_1.MongoClient.connect(url, { useNewUrlParser: true }, (err, db) => {
        if (err)
            throw err;
        badgeDB = req.params.shopname;
        const dbo = db.db(badgeDB);
        dbo
            .collection('badges')
            .find({ default: false }, { projection: { _id: 1 } })
            .toArray((error, result) => {
            if (error)
                throw error;
            let images;
            images = result;
            //  let ids = result[0];
            const ids = [];
            for (let i = 0; i < images.length; i++) {
                ids[i] = images[i]._id;
            }
            //    console.log(images[0]._id);
            console.log(ids);
            res.send(ids);
            // return ids;
        });
    });
}
exports.getUserIDS = getUserIDS;
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
function getProductPriceRange(req, res) {
    let myquery;
    const titles = [];
    const variants = [];
    const variants1 = [];
    const variants2 = [];
    const variants3 = [];
    const variantsId = [];
    const abids = [];
    const srcs = [];
    const pids = [];
    const tags1 = [];
    const price = [];
    const createdat = [];
    const isApplied = [];
    console.log('nside getProdPrice');
    const p1 = req.params.p1;
    console.log('p1: ' + p1);
    const p2 = req.params.p2;
    console.log('p2: ' + p2);
    // let myquery=req.params.query;
    const pr = req.params.pr;
    console.log('pr: ' + pr);
    // let myquery=req.params.query;
    if (pr === 'all') {
        myquery = {
            'variants.price': { $gte: parseInt(p1), $lte: parseInt(p2) }
            // 'variants': { price: { '$gte': p1, '$lte': p2 } }
        };
    }
    else if (pr === 'withBadges') {
        myquery = {
            'variants.price': { $gte: parseInt(p1), $lte: parseInt(p2) },
            badge: { $exists: true, $ne: [] }
        };
    }
    else if (pr === 'withoutBadges') {
        myquery = {
            'variants.price': { $gte: parseInt(p1), $lte: parseInt(p2) },
            badge: { $size: 0 }
        };
    }
    console.log(myquery);
    mongodb_1.MongoClient.connect(url, { useNewUrlParser: true }, (err, db) => {
        if (err)
            throw err;
        badgeDB = req.params.shopname;
        const dbo = db.db(badgeDB);
        dbo
            .collection(shop)
            .aggregate([
            {
                $project: {
                    _id: 1,
                    title: 1,
                    created_at: 1,
                    tags: 1,
                    badge: 1,
                    variants: 1
                }
            },
            { $unwind: '$variants' },
            { $match: myquery }
        ])
            .toArray((error, obj) => {
            if (error)
                throw error;
            const products = obj;
            console.log(products);
            //  let ids = result[0];
            for (let i = 0; i < products.length; i++) {
                const ab = [];
                const src = [];
                titles[i] = products[i].title;
                variants1[i] = products[i].variants.option1;
                if (variants1[i] === undefined) {
                    variants1[i] = '-';
                }
                variants2[i] = products[i].variants.option2;
                if (variants2[i] === undefined) {
                    variants2[i] = '-';
                }
                variants3[i] = products[i].variants.option3;
                if (variants3[i] === undefined) {
                    variants3[i] = '-';
                }
                variants[i] =
                    variants1[i] + ',' + variants2[i] + ',' + variants3[i];
                variantsId[i] = products[i].variants.id;
                // console.log(products[i].variants.length);
                console.log(variants[i]);
                pids[i] = products[i]._id;
                const x = products[i].created_at.split('T');
                createdat[i] = x[0];
                tags1[i] = products[i].tags;
                if (products[i].variants.badge &&
                    products[i].variants.badge.length > 0) {
                    let j = 0;
                    while (products[i].variants.badge[j]) {
                        ab[j] = products[i].variants.badge[j].abid;
                        src[j] = products[i].variants.badge[j].thumbnailSource;
                        // let q = { 'badge.Bid': products[i].variants.bids[j] };
                        // console.log(q);
                        // f
                        // unction (err, result) {
                        //     if (err) throw err;
                        //     src[j] = result.badge[0].thumbnailSource;
                        //     console.log('thmSRC');
                        //     console.log(result);
                        //     console.log(src[j]);
                        // });
                        // src[j] = products[i].variants.bids[j].thumbnailSource;
                        console.log('ab', ab[j]);
                        console.log('src', src[j]);
                        j++;
                    }
                    abids[i] = ab;
                    srcs[i] = src;
                    console.log('abids', abids[i]);
                    isApplied[i] = 'yes';
                }
                else {
                    isApplied[i] = 'no';
                    let j = 0;
                    ab[j] = '-';
                    src[j] = '-';
                    console.log('ab', ab[j]);
                    j++;
                    abids[i] = ab;
                    srcs[i] = src;
                }
                console.log('abids', abids[i]);
                console.log('src', srcs[i]);
            }
            console.log('abids', abids);
            console.log('SRC--', srcs);
            res.send({
                items: titles,
                pids,
                badge: abids,
                tags: tags1,
                created_at: createdat,
                isApplied,
                src: srcs,
                variants,
                variantsId
            });
        });
    });
}
exports.getProductPriceRange = getProductPriceRange;
function getProductDateRange(req, res) {
    let myquery;
    const titles = [];
    const bids = [];
    const abids = [];
    const srcs = [];
    const pids = [];
    const tags1 = [];
    const price = [];
    const createdat = [];
    const isApplied = [];
    console.log('inside getProdPrice');
    const d1 = req.params.d1;
    console.log('d1: ' + d1);
    const d2 = req.params.d2;
    console.log('d2: ' + d2);
    const dr = req.params.dr;
    console.log('dr: ' + dr);
    // let myquery=req.params.query;
    if (dr === 'all') {
        myquery = {
            created_at: { $gte: d1, $lte: d2 }
        };
    }
    else if (dr === 'withBadges') {
        myquery = {
            created_at: { $gte: d1, $lte: d2 },
            badge: { $exists: true, $ne: [] }
        };
    }
    else if (dr === 'withoutBadges') {
        myquery = {
            created_at: { $gte: d1, $lte: d2 },
            badge: { $not: { $size: 0 } }
        };
    }
    console.log(myquery);
    mongodb_1.MongoClient.connect(url, { useNewUrlParser: true }, (err, db) => {
        if (err)
            throw err;
        badgeDB = req.params.shopname;
        const dbo = db.db(badgeDB);
        dbo
            .collection(shop)
            .find(myquery, {
            projection: { _id: 1, title: 1, created_at: 1, tags: 1, badge: 1 }
        })
            .toArray((error, obj) => {
            if (error)
                throw error;
            const products = obj;
            console.log(obj);
            // let ids = result[0];
            for (let i = 0; i < products.length; i++) {
                const b = [];
                const ab = [];
                const src = [];
                titles[i] = products[i].title;
                pids[i] = products[i]._id;
                const x = products[i].created_at.split('T');
                createdat[i] = x[0];
                tags1[i] = products[i].tags;
                if (products[i].badge && products[i].badge.length > 0) {
                    let j = 0;
                    while (products[i].badge[j]) {
                        b[j] = products[i].badge[j].Bid;
                        ab[j] = products[i].badge[j].abid;
                        src[j] = products[i].badge[j].thumbnailSource;
                        console.log('b', b[j]);
                        console.log('src', src[j]);
                        j++;
                    }
                    bids[i] = b;
                    abids[i] = ab;
                    srcs[i] = src;
                    console.log('bids', bids[i]);
                    isApplied[i] = 'yes';
                }
                else {
                    isApplied[i] = 'no';
                    let j = 0;
                    b[j] = '-';
                    ab[j] = '-';
                    src[j] = '-';
                    console.log('b', b[j]);
                    j++;
                    bids[i] = b;
                    abids[i] = ab;
                    srcs[i] = src;
                }
                console.log('bids', bids[i]);
            }
            res.send({
                items: titles,
                pids,
                badge: abids,
                tags: tags1,
                created_at: createdat,
                isApplied,
                src: srcs
            });
        });
    });
}
exports.getProductDateRange = getProductDateRange;
function getProductTitle(req, res) {
    console.log('nside getProdTitle');
    let myquery;
    const t1 = req.params.t1;
    const tr = req.params.tr;
    const badge = [];
    const thumbnail = [];
    const titles = [];
    const bids = [];
    const abids = [];
    const srcs = [];
    const pids = [];
    const tags1 = [];
    const price = [];
    const createdat = [];
    const isApplied = [];
    console.log('t1: ' + t1);
    console.log('tr: ' + tr);
    //    let t = '/'+t1+'/i';
    if (tr === 'all') {
        myquery = {
            title: new RegExp(t1, 'i')
        };
    }
    else if (tr === 'withBadges') {
        myquery = {
            title: new RegExp(t1, 'i'),
            badge: { $exists: true, $ne: [] }
        };
    }
    else if (tr === 'withoutBadges') {
        myquery = {
            title: new RegExp(t1, 'i'),
            badge: { $exists: false }
        };
    }
    mongodb_1.MongoClient.connect(url, { useNewUrlParser: true }, (err, db) => {
        if (err)
            throw err;
        badgeDB = req.params.shopname;
        const dbo = db.db(badgeDB);
        dbo
            .collection(shop)
            .find(myquery, {
            projection: {
                _id: 1,
                title: 1,
                created_at: 1,
                tags: 1,
                badge: 1
            }
        })
            .toArray((error, obj) => {
            if (error)
                throw error;
            const products = obj;
            // let ids = result[0];
            for (let i = 0; i < products.length; i++) {
                const b = [];
                const ab = [];
                const src = [];
                titles[i] = products[i].title;
                pids[i] = products[i]._id;
                const x = products[i].created_at.split('T');
                createdat[i] = x[0];
                tags1[i] = products[i].tags;
                if (products[i].badge && products[i].badge.length > 0) {
                    let j = 0;
                    while (products[i].badge[j]) {
                        b[j] = products[i].badge[j].Bid;
                        ab[j] = products[i].badge[j].abid;
                        src[j] = products[i].badge[j].thumbnailSource;
                        console.log('b', b[j]);
                        j++;
                    }
                    bids[i] = b;
                    abids[i] = ab;
                    srcs[i] = src;
                    console.log('bids', bids[i]);
                    isApplied[i] = 'yes';
                }
                else {
                    isApplied[i] = 'no';
                    let j = 0;
                    b[j] = '-';
                    ab[j] = '-';
                    console.log('b', b[j]);
                    j++;
                    bids[i] = b;
                    abids[i] = ab;
                    srcs[i] = src;
                }
                console.log('bids', bids[i]);
            }
            console.log('src:' + badge);
            res.send({
                items: titles,
                pids,
                badge: abids,
                tags: tags1,
                created_at: createdat,
                isApplied,
                src: srcs,
                abids
            }); // , 'abids': abids
        });
    });
}
exports.getProductTitle = getProductTitle;
function getProductTag(req, res) {
    let myquery;
    const t1 = req.params.t1;
    const tr = req.params.tr;
    const badge = [];
    const thumbnail = [];
    const titles = [];
    const bids = [];
    const abids = [];
    const srcs = [];
    const pids = [];
    const tags1 = [];
    const price = [];
    const createdat = [];
    const isApplied = [];
    // let dbo = db.db(globalShop);
    console.log('inside getProdTag');
    // let myquery = { _id: ObjectId(req.params.id) };
    // let myquery = { 'variants.0.price':{$gte:'100'} };
    const tg1 = req.params.tg1;
    console.log('tg1: ' + tg1);
    console.log('tr: ' + tr);
    //    let t = '/'+t1+'/i';
    if (tr === 'all') {
        myquery = {
            tags: new RegExp(tg1, 'i')
        };
    }
    else if (tr === 'withBadges') {
        myquery = {
            tags: new RegExp(tg1, 'i'),
            badge: { $exists: true, $ne: [] }
        };
    }
    else if (tr === 'withoutBadges') {
        myquery = {
            tags: new RegExp(tg1, 'i'),
            badge: { $exists: false }
        };
    }
    mongodb_1.MongoClient.connect(url, { useNewUrlParser: true }, (err, db) => {
        if (err)
            throw err;
        badgeDB = req.params.shopname;
        const dbo = db.db(badgeDB);
        dbo
            .collection(shop)
            .find(myquery, {
            projection: { _id: 1, title: 1, created_at: 1, tags: 1, badge: 1 }
        })
            .toArray((error, obj) => {
            if (error)
                throw error;
            const products = obj;
            // let ids = result[0];
            for (let i = 0; i < products.length; i++) {
                const b = [];
                const ab = [];
                const src = [];
                titles[i] = products[i].title;
                pids[i] = products[i]._id;
                const x = products[i].created_at.split('T');
                createdat[i] = x[0];
                tags1[i] = products[i].tags;
                if (products[i].badge && products[i].badge.length > 0) {
                    let j = 0;
                    while (products[i].badge[j]) {
                        b[j] = products[i].badge[j].Bid;
                        ab[j] = products[i].badge[j].abid;
                        src[j] = products[i].badge[j].thumbnailSource;
                        console.log('b', b[j]);
                        j++;
                    }
                    bids[i] = b;
                    abids[i] = ab;
                    srcs[i] = src;
                    console.log('bids', bids[i]);
                    isApplied[i] = 'yes';
                }
                else {
                    isApplied[i] = 'no';
                    let j = 0;
                    b[j] = '-';
                    ab[j] = '-';
                    console.log('b', b[j]);
                    j++;
                    bids[i] = b;
                    abids[i] = ab;
                    srcs[i] = src;
                }
                console.log('bids', bids[i]);
            }
            res.send({
                items: titles,
                pids,
                badge: abids,
                tags: tags1,
                created_at: createdat,
                isApplied,
                src: srcs
            });
        });
    });
}
exports.getProductTag = getProductTag;
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
exports.getIDS = (req, res) => {
    console.log('inside get IDS');
    mongodb_1.MongoClient.connect(url, { useNewUrlParser: true }, (err, db) => {
        badgeDB = req.params.shopname;
        const dbo = db.db(badgeDB);
        dbo
            .collection('badges')
            .find({ default: true }, { projection: { _id: 1 } })
            .toArray((error, result) => {
            if (error)
                throw error;
            const images = result;
            // let ids = result[0];
            const ids = [];
            for (let i = 0; i < images.length; i++) {
                ids[i] = images[i]._id;
            }
            //    console.log(images[0]._id);
            console.log(ids);
            res.send(ids);
            // return ids;
        });
    });
};
exports.getUserIDS = (req, res) => {
    console.log('inside get User IDS');
    mongodb_1.MongoClient.connect(url, { useNewUrlParser: true }, (err, db) => {
        badgeDB = req.params.shopname;
        const dbo = db.db(badgeDB);
        dbo
            .collection('badges')
            .find({ default: false }, { projection: { _id: 1 } })
            .toArray((error, result) => {
            if (error)
                throw error;
            const images = result;
            // let ids = result[0];
            const ids = [];
            for (let i = 0; i < images.length; i++) {
                ids[i] = images[i]._id;
            }
            //    console.log(images[0]._id);
            console.log(ids);
            res.send(ids);
            // return ids;
        });
    });
};
function upload(req, res) {
    console.log('api/upload');
    if (!req.file) {
        alert('No file received');
        return res.redirect('http://localhost:4200/');
    }
    else {
        console.log('file received');
        console.log(req.file.originalname);
        mongodb_1.MongoClient.connect(url, { useNewUrlParser: true }, (err, db) => {
            if (err)
                throw err;
            console.log('upload Pic to mongo');
            const picname = req.file.originalname;
            console.log('pic file name=' + picname);
            // read the img file from tmp in-memory location
            const newImg = fse.readFileSync(req.file.path);
            const codedPicName = Math.random() * Math.pow(10, 20) + picname;
            fse.copySync(req.file.path, 'Badges/' + shop + '/image/' + codedPicName);
            const inputPathToYourImages = 'Badges/' + shop + '/image/*.{jpg,JPG,jpeg,JPEG,png,svg,gif}';
            const outputPath = 'Badges/' + shop + '/thumbnail/';
            compressImages(inputPathToYourImages, outputPath, {
                compress_force: false,
                statistic: true,
                autoupdate: true
            }, false, { jpg: { engine: 'mozjpeg', command: ['-quality', '60'] } }, { png: { engine: 'webp', command: ['-q', '60'] } }, // png -> webp
            { svg: { engine: 'svgo', command: '--multipass' } }, {
                gif: {
                    engine: 'gif2webp',
                    command: ['-f', '80', '-mixed', '-q', '30', '-m', '2']
                }
            }, () => { } // gif -> webp
            );
            // encode the file as a base64 string.
            const encImg = newImg.toString('base64');
            // define your new document
            let newpicname = codedPicName;
            if (req.file.mimetype === 'image/png' ||
                req.file.mimetype === 'image/gif') {
                const split = codedPicName.split('.');
                newpicname = split[0] + '.webp';
            }
            const newItem = {
                // size: req.file.size,
                // img: Buffer(encImg, 'base64'),
                imageName: codedPicName,
                imageSource: 'http://localhost:4567/Badges/' + shop + '/image/' + codedPicName,
                thumbnailSource: 'http://localhost:4567/Badges/' + shop + '/thumbnail/' + newpicname,
                contentType: req.file.mimetype
            };
            badgeDB = req.params.shopname;
            const dbo = db.db(badgeDB);
            dbo.collection('badges').insert(newItem, (error, result) => {
                if (error) {
                    console.log(error);
                }
                const newoid = new ObjectId(result.ops[0]._id);
                fse.remove(req.file.path, fileError => {
                    if (fileError) {
                        console.log(fileError);
                    }
                    console.log('uploaded: ' + newoid);
                });
                res.send(newoid);
            });
            console.log('upload done');
            // return res.redirect('http://localhost:4200/');
        });
    }
}
exports.upload = upload;
function deleteBadge(req, res) {
    console.log('Entered delete badge');
    mongodb_1.MongoClient.connect(url, { useNewUrlParser: true }, (err, db) => {
        if (err)
            throw err;
        badgeDB = req.params.shopname;
        const dbo = db.db(badgeDB);
        const myquery = { imageName: req.body.name };
        console.log(myquery);
        fse.removeSync('Badges/' + shop + '/image/' + req.body.name);
        let newpicname = req.body.name;
        const split = req.body.name.split('.');
        if (split[1] === 'gif' || split[1] === 'png') {
            newpicname = split[0] + '.webp';
        }
        fse.removeSync('Badges/' + shop + '/thumbnail/' + newpicname);
        dbo.collection('badges').deleteOne(myquery, (error, obj) => {
            if (error)
                throw error;
            if (obj.deletedCount) {
                // console.log(obj);
                res.send(true);
            }
            else {
                res.send(false);
            }
        });
    });
}
exports.deleteBadge = deleteBadge;
function tags(req, res) {
    mongodb_1.MongoClient.connect(url, { useNewUrlParser: true }, (err, db) => {
        if (err)
            throw err;
        badgeDB = req.params.shopname;
        const dbo = db.db(badgeDB);
        dbo
            .collection(shop)
            .find({}, { projection: { tags: 1 } })
            .toArray((error, obj) => {
            if (error)
                throw error;
            const products = obj;
            console.log(obj);
            // let ids = result[0];
            const tagsArray = [];
            for (const product of products) {
                tagsArray.push(product.tags);
            }
            console.log('tags: ' + tagsArray);
            // console.log('product found: ' + );
            // res.send(obj);
            // res.render('selectproducts', { items: titles, pids: pids });
            res.send(tagsArray);
        });
    });
}
exports.tags = tags;
function currency(req, res) {
    mongodb_1.MongoClient.connect(url, { useNewUrlParser: true }, (err, db) => {
        if (err)
            throw err;
        const dbo = db.db('TriconBadgeApp');
        const dbshop = shopName.split('.');
        console.log(dbshop[0]);
        dbo
            .collection(shopName)
            .find({ shopname: dbshop[0] }, { projection: { currency: 1 } })
            .toArray((error, obj) => {
            if (error)
                throw error;
            console.log('obj');
            console.log(obj);
            const cur = obj[0].currency;
            console.log('cur' + cur);
            // let ids = result[0];
            res.send(obj);
        });
    });
}
exports.currency = currency;
//# sourceMappingURL=../../src/dist/controller/angular.controller.js.map