const dotenv = require('dotenv').config();
const nonce = require('nonce')();
const crypto = require('crypto');
const cookie = require('cookie');
const querystring = require('querystring');
const request = require('request-promise');

const scopes = 'read_products';

// Replace this with your HTTPS Forwarding address
const forwardingAddress = "https://a230f3ec.ngrok.io";

const apiKey = process.env.SHOPIFY_API_KEY;
const apiSecret = process.env.SHOPIFY_API_SECRET;

var globalToken = undefined;
var globalShop = undefined;
var globalShopResponse = undefined;

console.log('Entered Controller');

// Install app
exports.install = (req, res) => {
    const shop = req.query.shop;
    if (shop) {
        const state = nonce();
        const redirectUri = forwardingAddress + '/shopify/callback';
        const installUrl = 'https://' + shop +
            '/admin/oauth/authorize?client_id=' + apiKey +
            '&scope=' + scopes +
            '&state=' + state +
            '&redirect_uri=' + redirectUri;

        res.cookie('state', state);
        res.redirect(installUrl);
    } else {
        return res.status(400).send('Missing shop parameter. Please add ?shop=your-development-shop.myshopify.com to your request');
    }
};

// Auth - HMAC,accessToken,cookie
exports.auth = (req, res) => {
    const { shop, hmac, code, state } = req.query;
    const stateCookie = cookie.parse(req.headers.cookie).state;

    if (state !== stateCookie) {
        return res.status(403).send('Request origin cannot be verified');
    }

    if (shop && hmac && code) {
        // TODO
        // Validate request is from Shopify  
        const map = Object.assign({}, req.query);
        delete map['signature'];
        delete map['hmac'];
        const message = querystring.stringify(map);
        const providedHmac = Buffer.from(hmac, 'utf-8');
        const generatedHash = Buffer.from(
            crypto
                .createHmac('sha256', apiSecret)
                .update(message)
                .digest('hex'),
            'utf-8'
        );
        let hashEquals = false;
        // timingSafeEqual will prevent any timing attacks. Arguments must be buffers
        try {
            hashEquals = crypto.timingSafeEqual(generatedHash, providedHmac)
            // timingSafeEqual will return an error if the input buffers are not the same length.
        } catch (e) {
            hashEquals = false;
        };

        if (!hashEquals) {
            return res.status(400).send('HMAC validation failed');
        }

        // Exchange temporary code for a permanent access token
        const accessTokenRequestUrl = 'https://' + shop + '/admin/oauth/access_token';
        const accessTokenPayload = {
            client_id: apiKey,
            client_secret: apiSecret,
            code,
        };

        request.post(accessTokenRequestUrl, { json: accessTokenPayload })
            .then((accessTokenResponse) => {
                globalToken = accessTokenResponse.access_token;
                globalShop = shop;
                console.log("Shop: " + shop);

                // TODO
                // Use access token to make API call to 'shop' endpoint
                const shopRequestUrl = 'https://' + shop + '/admin/products.json';
                const shopRequestHeaders = {
                    'X-Shopify-Access-Token': globalToken,
                };

                request.get(shopRequestUrl, { headers: shopRequestHeaders })
                    .then((shopResponse) => {

                        console.log("Token: " + globalToken);

                        res.redirect('/static/welcome.html');
                        // console.log("Shop Response: "+shopResponse);
                        globalShopResponse = shopResponse;
                        // console.log("Global Shop Response: "+globalShopResponse);

                        // copyDB(); //using func
                        // API call to copy Shopify DB ton our DB
                        request.get('https://c0a63639.ngrok.io/copyDB');
                        // console.log("Started copying DB");

                        //deleteProd(1451088838726);
                        //res.end(shopResponse.body.products);
                    })
                    .catch((error) => {
                        res.status(error.statusCode).send(error.error.error_description);
                    });

            })
            .catch((error) => {
                res.status(error.statusCode).send(error.error.error_description);
            });
    } else {
        res.status(400).send('Required parameters missing');
    }
};

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
var url = "mongodb://"+process.env.dbuser+":"+process.env.dbpassword+"@ds239682.mlab.com:39682/shopifydbclone";
// DO NOT USE @ IN DB_PASSWORD

// Copy Shopify DB to our DB
exports.copyDB = (req, res) => {
    // console.log("Shop Response: "+globalShopResponse);
    console.log('Entered copyDB');

    var prod_list = JSON.parse(globalShopResponse).products;
    console.log("Products: " + prod_list);

    // MongoClient.connect(url, {uri_decode_auth: true, useNewUrlParser: true} , function (err, db) {
    // MongoClient.connect(encodeURI(process.env.DB_CONNECT), {uri_decode_auth: true} , function (err, db) {
    // MongoClient.connect(url, {
    //     auth: {
    //       user:'mongodb',
    //       password:'123'
    //     },
    //     useNewUrlParser:true
    //   }, function (err, db) {
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