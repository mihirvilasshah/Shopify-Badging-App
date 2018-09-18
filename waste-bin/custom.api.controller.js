const dotenv = require('dotenv').config();
const nonce = require('nonce')();
const crypto = require('crypto');
const cookie = require('cookie');
const querystring = require('querystring');
const request = require('request-promise');

const scopes = 'read_products';

// Replace this with your HTTPS Forwarding address
const forwardingAddress = "https://c6ab7d89.ngrok.io";

const apiKey = process.env.SHOPIFY_API_KEY;
const apiSecret = process.env.SHOPIFY_API_SECRET;

var globalToken = undefined;
var globalShop = undefined;
var globalShopResponse = undefined;

console.log('Entered Custom Controller');

// Product page 
exports.productPage = (req, res) => {
    const shopRequestUrl = 'https://' + globalShop + '/admin/products.json';
    const shopRequestHeaders = {
        'X-Shopify-Access-Token': globalToken,
    };

    request.get(shopRequestUrl, { headers: shopRequestHeaders })
        .then((shopResponse) => {
            res.json(JSON.parse(shopResponse));
        }).catch((err) => {
            console.log(err);
            res.send(err);
        });
};

// MongoDB
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId
// var url = "mongodb://localhost:27017/";
// mLab DaaS URI
var url = "mongodb://"+process.env.DB_USER+":"+process.env.DB_PASSWORD+"@ds239682.mlab.com:39682/shopifydbclone";
// DO NOT USE @ or other special characters IN DB_PASSWORD

// Copy Shopify DB to our DB
exports.copyDB = (req, res) => {
    // console.log("Shop Response: "+globalShopResponse);
    console.log('Entered copyDB');

    var prod_list = JSON.parse(globalShopResponse).products;
    console.log("Products: " + prod_list);

    MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
        if (err) throw err;

        var dbo = db.db("shopifydbclone");

        prod_list.forEach(function (item) {
            dbo.collection("shopify_collection").insertOne(item, function (err, res) {
                if (err) throw err;
                console.log("Number of documents inserted: " + res.insertedCount);
            });
        });
        res.send({ message: "Products copied to DB" });
        db.close();
    });
};

// Delete product from our DB when triggered from webhook 
exports.deleteProduct = (req, res) => {
    console.log('Entered deleteProduct');
    MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
        if (err) throw err;

        var dbo = db.db("shopify");

        console.log("inside deleteProd");
        var myquery = { _id: ObjectId(req.params.id) };
        dbo.collection("shopify_collection").deleteOne(myquery, function (err, obj) {
            if (err) throw err;
            console.log("product deleted:" + obj.deletedCount);
        });
        res.send({ message: "Product deleted" });
        db.close();
    });
};

// Update product from our DB when triggered from webhook
exports.updateProduct = (req, res) => {
    MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
        if (err) throw err;

        var dbo = db.db("shopify");

        console.log("inside updateProd");
        // var myquery = { _id: ObjectId(req.params.id) };
        var myquery = { id: parseInt(req.params.id) };
        console.log("id: "+req.params.id);
        var newvalues = { $set: req.body };
        dbo.collection("shopify_collection").updateOne(myquery, newvalues, function (err, obj) {
            if (err) throw err;
            console.log("product updated:" + obj);
        });
        res.send({ message: "Product updated" });
        db.close();
    });
};

// Create product in our DB when triggered by webhook
exports.createProduct = (req, res) => {
    MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
        if (err) throw err;

        var dbo = db.db("shopify");

        console.log("inside createProd");
        var myquery = req.body;
        dbo.collection("shopify_collection").insertOne(myquery, function (err, obj) {
            if (err) throw err;
            console.log("product created/added: " + obj.insertedCount);
        });
        res.send({ message: "Product created/added" });
        db.close();
    });
};

//Read product in our DB
exports.getProduct = (req, res) => {
    MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
        if (err) throw err;

        var dbo = db.db("shopify");

        console.log("inside getProd");
        // var myquery = { _id: ObjectId(req.params.id) };
        var myquery = { id: parseInt(req.params.id) };
        // var myquery = { id: 1466289291362 };
        console.log("id: "+req.params.id);
        dbo.collection("shopify_collection").findOne(myquery, function (err, obj) {
            if (err) throw err;
            console.log("product found: " + obj);
            res.send(obj);
        });
        // res.send({ message: "Found product" });
        db.close();
    });
};