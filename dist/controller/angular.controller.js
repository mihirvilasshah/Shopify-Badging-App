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
const AWS = require('aws-sdk');
AWS.config = new AWS.Config();
AWS.config.accessKeyId = 'AKIAID5GWPR3YVVOHTPA';
AWS.config.secretAccessKey = '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';
const s3 = new AWS.S3();
// const forwardingAddress = 'https://dc7a4f9d.ngrok.io';
const url = 'mongodb://localhost:27017/';
let badgeDB = 'tricon-jewel-store';
const shop = 'Products';
const shopName = 'tricon-jewel-store.myshopify.com';
const S3 = require('../DAO/S3connection');
const mongoClient = require('mongodb').MongoClient;
function getbadgedata() {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            console.log('afdza');
            const params = { Bucket: 'anumula', Key: 'badges.json' };
            s3.getObject(params, (err, data) => {
                let badgedata = [];
                if (err) {
                    console.error(err);
                }
                else {
                    const objectData = data.Body.toString('utf-8');
                    badgedata = JSON.parse(objectData);
                    // console.log('asf' + objectData);
                }
                resolve(badgedata);
            });
        });
    });
}
exports.getbadgedata = getbadgedata;
function bresult(badgeData) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            const badgeresults = [];
            for (const badge of badgeData) {
                badgeresults.push({
                    imageSource: badge.imageSource,
                    thumbnailSource: badge.thumbnailSource
                });
            }
            resolve(badgeresults);
        });
    });
}
exports.bresult = bresult;
function getMybadges(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const badgeData = yield getbadgedata();
        // console.log(badgeData);
        // badges.push(badgeData);
        const badgeresult = yield bresult(badgeData);
        console.log(badgeresult);
        res.send(badgeresult);
    });
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
function getProductDiscountRange(req, res) {
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
    console.log('Inside Discount');
    const d1 = req.params.d1;
    const d2 = req.params.d2;
    console.log('d1: ' + d1);
    const pr = req.params.pr;
    console.log('pr: ' + pr);
    // let myquery=req.params.query;
    if (pr === 'all') {
        myquery = { 'variants.discount': parseInt(d1) };
        // 'variants': { price: { '$gte': p1, '$lte': p2 } }
    }
    else if (pr === 'withBadges') {
        myquery = {
            'variants.discount': parseInt(d1),
            badge: { $exists: true, $ne: [] }
        };
    }
    else if (pr === 'withoutBadges') {
        myquery = { 'variants.discount': parseInt(d1), badge: { $size: 0 } };
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
exports.getProductDiscountRange = getProductDiscountRange;
// -----------------------------------------------------------------------------------------------
function upload(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('api/upload');
        if (!req.file) {
            alert('No file received');
            return res.redirect('http://localhost:4200/');
        }
        else {
            console.log('file received');
            console.log(req.file);
            const uploaded = yield uploadImage(req, res);
            const badgeData = yield getbadgedata();
            // console.log(badgeData);
            const badgeinfo = yield badgeDat(req, res, badgeData);
        }
    });
}
exports.upload = upload;
function uploadImage(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            const params = {
                Bucket: 'anumula',
                Key: 'BadgePictures/' + req.file.originalname,
                Body: req.file.buffer
            };
            s3.upload(params, (err, data) => {
                if (err) {
                    res.status(500).json({ error: 'Error -> ' + err });
                }
                res.json({
                    message: 'File uploaded successfully! -> keyname = ' + req.file.originalname
                });
            });
            resolve('done');
        });
    });
}
exports.uploadImage = uploadImage;
function badgeDat(req, res, oData) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            const badgeid = Math.random() * Math.pow(10, 20);
            const imagesrc = 'https://s3.amazonaws.com/anumula/' + req.file.originalname;
            const type = req.file.mimetype;
            const badgeData = {
                _id: badgeid,
                imagename: req.file.originalname,
                imageSource: imagesrc,
                thumbnailSource: imagesrc,
                contentType: type
            };
            oData.push(badgeData);
            // console.log(oData);
            const data = JSON.stringify(oData);
            const params1 = { Bucket: 'anumula', Key: 'badges.json', Body: data };
            s3.upload(params1, (s3Err, dat) => {
                if (s3Err)
                    throw s3Err;
                console.log(`File uploaded successfully at ${dat.Location}`);
            });
            resolve('done');
        });
    });
}
exports.badgeDat = badgeDat;
// --------------------------------------------------------------------------------
function deleteinfo(badgeData, imagename) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            for (const badge of badgeData) {
                if (badge.imagename === imagename) {
                    const index = badgeData.indexOf(badge);
                    if (index > -1) {
                        badgeData.splice(index, 1);
                    }
                }
            }
            resolve(badgeData);
        });
    });
}
exports.deleteinfo = deleteinfo;
function deleteBadge(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Entered delete badge');
        const imagename = req.body.name;
        const params = { Bucket: 'anumula', Key: 'BadgePictures/' + imagename };
        s3.deleteObject(params, (err, data1) => {
            if (data1) {
                console.log('File deleted successfully');
            }
            else {
                console.log('Check if you have sufficient permissions : ' + err);
            }
        });
        const badgeData = yield getbadgedata();
        const deleted = yield deleteinfo(badgeData, imagename);
        console.log(deleted);
        const data = JSON.stringify(deleted);
        const params1 = { Bucket: 'anumula', Key: 'badges.json', Body: data };
        s3.upload(params1, (s3Err, dat) => {
            if (s3Err)
                throw s3Err;
            console.log(`File uploaded successfully at ${dat.Location}`);
        });
        res.send(true);
    });
}
exports.deleteBadge = deleteBadge;
// done--------------------------------------------------------------------------------------------
function tags(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const tagsArray = yield getTags();
        // console.log(tagsArray);
        res.send(tagsArray);
    });
}
exports.tags = tags;
function getTags() {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            // let proddata;
            const params = { Bucket: 'anumula', Key: 'products.json' };
            const tagsArray = [];
            s3.getObject(params, (err, data) => {
                if (err)
                    console.error(err);
                const objectData = data.Body.toString('utf-8');
                const proddata = JSON.parse(objectData);
                for (const prod of proddata) {
                    tagsArray.push(prod.tags);
                }
                resolve(tagsArray);
            });
        });
    });
}
exports.getTags = getTags;
function metaFields(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const metafields = yield getmetaFields();
        res.send(metafields);
        console.log(metafields);
    });
}
exports.metaFields = metaFields;
function getmetaFields() {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            const metafields = [];
            const params = { Bucket: 'anumula', Key: 'products.json' };
            s3.getObject(params, (err, data) => {
                if (err)
                    console.error(err);
                const objectData = data.Body.toString('utf-8');
                const proddata = JSON.parse(objectData);
                for (const prod of proddata) {
                    for (const e of prod.metafields) {
                        if (prod.metafields.length > 0) {
                            metafields.push({
                                namespace: e.namespace,
                                key: e.key,
                                value: e.value
                            });
                        }
                    }
                }
                resolve(metafields);
            });
        });
    });
}
exports.getmetaFields = getmetaFields;
function currency(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const curr = yield getCurrency();
        res.send(curr);
    });
}
exports.currency = currency;
function getCurrency() {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            const params = { Bucket: 'anumula', Key: 'shopdetails.json' };
            s3.getObject(params, (err, data) => {
                if (err)
                    console.error(err);
                const objectData = data.Body.toString('utf-8');
                const jsonData = JSON.parse(objectData);
                const curr = jsonData.currency;
                console.log(curr);
                resolve(curr);
            });
        });
    });
}
exports.getCurrency = getCurrency;
//# sourceMappingURL=../../src/dist/controller/angular.controller.js.map