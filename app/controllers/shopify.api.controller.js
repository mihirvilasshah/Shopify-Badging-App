const dotenv = require('dotenv').config();
const nonce = require('nonce')();
const crypto = require('crypto');
const cookie = require('cookie');
const querystring = require('querystring');
const request = require('request-promise');

const scopes = 'read_products';
// const scopes = 'read_products,read_themes,write_themes';

// Replace this with your HTTPS Forwarding address
const forwardingAddress = process.env.FORWARDING_ADDRESS;

const apiKey = process.env.SHOPIFY_API_KEY;
const apiSecret = process.env.SHOPIFY_API_SECRET;

var globalToken = undefined;
var globalShop = undefined;
var globalShopResponse = undefined;

console.log('Entered Shopify Controller');

// var webhookPCFlag = 0;
// var webhookPDFlag = 0;
// var webhookPUFlag = 0;

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

                // Use access token to make API call to 'shop' endpoint
                const shopRequestUrl = 'https://' + shop + '/admin/products.json';
                const shopRequestHeaders = {
                    'X-Shopify-Access-Token': globalToken,
                };

                request.get(shopRequestUrl, { headers: shopRequestHeaders })
                    .then((shopResponse) => {

                        console.log("Token: " + globalToken);

                        // res.redirect('/static/welcome.html');
                        res.render('index', {
                            apiKey: process.env.SHOPIFY_API_KEY,
                            shopOrigin: 'https://'+ globalShop,
                            forwardingAddress: process.env.FORWARDING_ADDRESS

                        });
                        // console.log("Shop Response: "+shopResponse);
                        globalShopResponse = shopResponse;
                        // console.log("Global Shop Response: "+globalShopResponse);

                        // copyDB(); //using func
                        // TODO: Make sure that DB copying is only done once
                        // API call to copy Shopify DB ton our DB

                        request.get(forwardingAddress + '/copyDB');
                        request.get(forwardingAddress + '/createWebhooks');
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



// Create Webhooks 
exports.createWebhooks = (req, res) => {
    // Webhook products/create      
    const Webhookjson = {
        webhook: {
            topic: "products/create",
            address: forwardingAddress + "/createProduct",
            format: "json",
        }
    };

    const webhookheaders = {
        'X-Shopify-Access-Token': process.env.TOKEN,
        // 'X-Shopify-Topic': "products/create",
        // 'X-Shopify-Shop-Domain': globalShop,
        'Content-Type': "application/json"
    };

    const webhookUrl = 'https://' + globalShop + '/admin/webhooks.json';

    // if (webhookPCFlag == 0) {
    request.post(webhookUrl, { headers: webhookheaders, json: Webhookjson })
        .then((webresponse) => {
            console.log(webresponse);
        })
        .catch((error) => {
            if (error) throw error;
        });
    // }

    // Webhook products/update      
    const Webhookjson2 = {
        webhook: {
            topic: "products/update",
            address: forwardingAddress + "/updateProduct",
            format: "json",
        }
    };

    // if (webhookPUFlag == 0) {
    request.post(webhookUrl, { headers: webhookheaders, json: Webhookjson2 })
        .then((webresponse) => {
            console.log(webresponse);
            console.log("inside webhook call");
        })
        .catch((error) => {
            if (error) throw error;
        });
    webhookPCFlag = 1;
    // }

    // Webhook products/delete      
    const Webhookjson3 = {
        webhook: {
            topic: "products/delete",
            address: forwardingAddress + "/deleteProduct",
            format: "json",
        }
    };

    // if (webhookPDFlag == 0) {
    request.post(webhookUrl, { headers: webhookheaders, json: Webhookjson3 })
        .then((webresponse) => {
            console.log(webresponse);
            console.log("inside webhook call products/delete");
        })
        .catch((error) => {
            if (error) throw error;
        });
    // }

}
// webhookPCFlag = 1;
// webhookPUFlag = 1;
// webhookPDFlag = 1;


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
var url = "mongodb://localhost:27017/";
// mLab DaaS URI
// var url = "mongodb://" + process.env.DB_USER + ":" + process.env.DB_PASSWORD + "@ds239682.mlab.com:39682/shopifydbclone";
// DO NOT USE @ or other special characters IN DB_PASSWORD

// var flag = 0;
// Copy Shopify DB to our DB
exports.copyDB = (req, res) => {
    // console.log("Shop Response: "+globalShopResponse);
    console.log('Entered copyDB');

    var prod_list = JSON.parse(globalShopResponse).products;
    console.log("Products: " + prod_list);

    MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
        if (err) throw err;

        var dbo = db.db("shopifydbclone");

        // if (flag == 0) {
        prod_list.forEach(function (item) {
            dbo.collection("shopify_collection").insertOne(item, function (err, result) {
                if (err) throw err;
                console.log("Number of documents inserted: " + result.insertedCount);
            });
        });

        // }
        res.send({ message: "Products copied to DB" });
        db.close();
    });
};
// flag = 1;

// Delete product from our DB when triggered from webhook 
exports.deleteProduct = (req, res) => {
    console.log('Entered deleteProduct');
    MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
        if (err) throw err;

        var dbo = db.db("shopifydbclone");

        console.log("inside deleteProd");
        var prod_id = parseInt(req.body.id);
        // var myquery = { _id: ObjectId(req.params.id) };
        var myquery = { id: prod_id };

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

        var dbo = db.db("shopifydbclone");

        console.log("inside updateProd");
        // var myquery = { _id: ObjectId(req.params.id) };
        // var prod_id = parseInt(JSON.parse(req).id);
        var prod_id = parseInt(req.body.id);

        // var myquery = { id: parseInt(req.params.id) };
        var myquery = { id: prod_id };
        // console.log("id: " + req.params.id);
        console.log("id: " + prod_id);

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

        var dbo = db.db("shopifydbclone");

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

        var dbo = db.db("shopifydbclone");

        console.log("inside getProd");
        // var myquery = { _id: ObjectId(req.params.id) };
        var myquery = { id: parseInt(req.params.id) };
        // var myquery = { id: 1466289291362 };
        console.log("id: " + req.params.id);
        dbo.collection("shopify_collection").findOne(myquery, function (err, obj) {
            if (err) throw err;
            console.log("product found: " + obj);
            res.send(obj);
        });
        // res.send({ message: "Found product" });
        db.close();
    });
};

// const fsonly = require('fs');
const fs = require('fs-extra');
// const multer = require('multer')
// const upload = multer({ limits: { fileSize: 2000000 }, dest: '/uploads/' })

// Upload Pic
exports.uploadPic = (req, res) => {
    // console.log("Shop Response: "+globalShopResponse);
    console.log('upload Pic');

    if (req.file == null) {
        console.log('upload Pic null');
        console.log(req.file);
        // If Submit was accidentally clicked with no file selected...
        res.render('modal_content', { title: 'Please select a picture file to submit!' });
    } else {
        MongoClient.connect(url, function (err, db) {
            console.log('upload Pic to mongo');
            console.log(req.file.path);
            // read the img file from tmp in-memory location
            var newImg = fs.readFileSync(req.file.path);
            // encode the file as a base64 string.
            var encImg = newImg.toString('base64');
            // define your new document
            var newItem = {
                contentType: req.file.mimetype,
                size: req.file.size,
                img: Buffer(encImg, 'base64')
            };
            var dbo = db.db("shopifydbclone");
            dbo.collection('shopify_collection')
                .insert(newItem, function (err, result) {
                    if (err) { console.log(err); };
                    var newoid = new ObjectId(result.ops[0]._id);
                    fs.remove(req.file.path, function (err) {
                        if (err) { console.log(err) };

                        // var img = document.createElement("IMG");
                        // img.setAttribute("src", forwardingAddress + '/picture/' + newoid);
                        res.render('picture', { src: forwardingAddress + '/picture/' + newoid });
                        // res.send("Img can be viewed at: " + forwardingAddress + '/picture/' + newoid);
                    });
                });
        });
    }


    // MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
    //     if (err) throw err;
    //     console.log(req.query);

    //     var dbo = db.db("shopifydbclone");
    //     var myquery = req.query;

    //     // // write to a new file named 2pac.txt
    //     // fs.writeFile('pic.txt', res, (err) => {
    //     //     // throws an error, you could also catch it here
    //     //     if (err) throw err;

    //     //     // success case, the file was saved
    //     //     console.log('Lyric saved!');
    //     // });

    //     dbo.collection("shopify_collection").insertOne(myquery, function (err, result) {
    //         if (err) throw err;
    //         console.log("Number of documents inserted: " + result);
    //     });

    //     res.send({ message: "Pic uploaded to DB" });
    //     db.close();
    // });
};

// Upload Pic
exports.getPicture = (req, res) => {
    // assign the URL parameter to a variable
    var filename = req.params.picture;
    // open the mongodb connection with the connection
    // string stored in the variable called url.
    MongoClient.connect(url, function (err, db) {
        var dbo = db.db("shopifydbclone");
        dbo.collection('shopify_collection')
            // perform a mongodb search and return only one result.
            // convert the variable called filename into a valid objectId.
            .findOne({ '_id': ObjectId(filename) }, function (err, results) {
                // set the http response header so the browser knows this
                // is an 'image/jpeg' or 'image/png'
                res.setHeader('content-type', results.contentType);
                // send only the base64 string stored in the img object
                // buffer element
                res.send(results.img.buffer);
            });
    });
}