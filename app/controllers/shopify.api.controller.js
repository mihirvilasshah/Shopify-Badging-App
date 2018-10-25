const dotenv = require('dotenv').config();
const nonce = require('nonce')();
const crypto = require('crypto');
const cookie = require('cookie');
const querystring = require('querystring');
const request = require('request-promise');
const path = require('path');
const fs = require('fs');
const fse = require('fs-extra');
const express = require('express');
const multer = require('multer');
const bodyParser = require('body-parser');
const app = express();
const router = express.Router();
var compress_images = require('compress-images');

const scopes = 'read_products,read_script_tags,write_script_tags,read_themes,write_themes';
// const scopes = 'read_products,read_themes,write_themes';

// Replace this with your HTTPS Forwarding address
const forwardingAddress = process.env.FORWARDING_ADDRESS;

const apiKey = process.env.SHOPIFY_API_KEY;
const apiSecret = process.env.SHOPIFY_API_SECRET;

var globalToken = undefined;
var globalShop='tricon-jewel-store.myshopify.com';
var globalShopResponse = undefined;

var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId
var url = "mongodb://localhost:27017/";


console.log('Entered Shopify Controller');

exports.install = (req, res) => {
    console.log("inside install");
    const shop = req.query.shop;
    globalShop = req.query.shop;
    console.log(shop);
    if (shop) {
        debugger;
        console.log("shop defined");
        const state = nonce();
        const redirectUri = forwardingAddress + '/shopify/callback';
        const AppUri = forwardingAddress + '/shopify/' + shop;
        const installUrl = 'https://' + shop +
            '/admin/oauth/authorize?client_id=' + apiKey +
            '&scope=' + scopes +
            '&state=' + state +
            '&redirect_uri=' + redirectUri;
        const appUrl = 'https://' + shop +
            '/admin/oauth/authorize?client_id=' + apiKey +
            '&scope=' + scopes +
            '&state=' + state +
            '&redirect_uri=' + AppUri;

        res.cookie('state', state);
        res.redirect(installUrl);

        // MongoClient.connect(url, function (err, db) {
        //     var dbo = db.db("shopifydbclone");
        //     dbo.listCollections({ name: shop })
        //         .next(function (err, collinfo) {
        //             if (!collinfo) {

        //                 res.redirect(installUrl);
        //             }
        //             else {

        //                 res.redirect(appUrl);
        //             }
        //         });
        // });
    } else {
        return res.status(400).send('Missing shop parameter. Please add ?shop=your-development-shop.myshopify.com to your request');
    }
};
exports.App = (req, res) => {


    console.log("Entered app");

    var images;
    var flag = 0;
    MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
        var dbo = db.db("shopifydbclone");
        dbo.collection("badges").find({ "default": false }, { projection: { contentType: 0, size: 0, img: 0 } }).toArray(function (err, result) {
            if (err) throw err;

            images = result;
            //var ids = result[0];
            var ids = [];
            for (var i = 0; i < images.length; i++) {
                ids[i] = images[i]._id;
            }

            //    console.log(images[0]._id);
            console.log(ids);

            dbo.collection("badges").find({ "default": true }, { projection: { contentType: 0, size: 0, img: 0 } }).toArray(function (err, result) {
                if (err) throw err;

                images = result;
                //var ids = result[0];
                var lids = [];
                for (var i = 0; i < images.length; i++) {
                    lids[i] = images[i]._id;
                }

                //    console.log(images[0]._id);
                console.log(lids);


                // res.render('selectbadge', {
                //     apiKey: process.env.SHOPIFY_API_KEY,
                //     shopOrigin: 'https://' + globalShop,
                //     ids: ids,
                //     lids: lids,


                //     forwardingAddress: process.env.FORWARDING_ADDRESS
                // });

                res.redirect('/static/welcome.html');

            });
        });
    });
}

// Auth - HMAC,accessToken,cookie
exports.auth = (req, res) => {
    console.log("inside auth");
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
                console.log("Token: " + globalToken);

                // Use access token to make API call to 'shop' endpoint
                const shopRequestUrl = 'https://' + shop + '/admin/products.json';
                const shopRequestHeaders = {
                    'X-Shopify-Access-Token': globalToken,
                };

                request.get(shopRequestUrl, { headers: shopRequestHeaders })
                    .then((shopResponse) => {

                        console.log("Token: " + globalToken);
                        
                   

                        MongoClient.connect(url, function (err, db) {
                            var dbo = db.db("shopifydbclone");
                            dbo.listCollections({ name: globalShop })
                                .next(function (err, collinfo) {
                                     if (!collinfo) {
                                        request.get(forwardingAddress + '/copyDB');
                                        request.get(forwardingAddress + '/createWebhooks');
                                        request.get(forwardingAddress + '/creatscript');
                                        request.get(forwardingAddress + '/shopdet');
                                        request.get(forwardingAddress + '/creatscript');
                                        // console.log("Started copying DB");
                                    }
                                });
                        });



                        //var image = getPictures();
                        var images;
                        var flag = 0;
                        MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
                            var dbo = db.db("shopifydbclone");
                            dbo.collection("badges").find({ "default": false }, { projection: { contentType: 0, size: 0, img: 0 } }).toArray(function (err, result) {
                                if (err) throw err;

                                images = result;
                                //var ids = result[0];
                                var ids = [];
                                for (var i = 0; i < images.length; i++) {
                                    ids[i] = images[i]._id;
                                }

                                //    console.log(images[0]._id);
                                console.log(ids);

                                dbo.collection("badges").find({ "default": true }, { projection: { contentType: 0, size: 0, img: 0 } }).toArray(function (err, result) {
                                    if (err) throw err;

                                    images = result;
                                    //var ids = result[0];
                                    var lids = [];
                                    for (var i = 0; i < images.length; i++) {
                                        lids[i] = images[i]._id;
                                    }

                                    //    console.log(images[0]._id);
                                    console.log(lids);


                                    // res.render('selectbadge', {
                                    //     apiKey: process.env.SHOPIFY_API_KEY,
                                    //     shopOrigin: 'https://' + globalShop,
                                    //     ids: ids,
                                    //     lids: lids,


                                    //     forwardingAddress: process.env.FORWARDING_ADDRESS
                                    // });

                                    res.redirect('/static/welcome.html');

                                });
                            });
                        });

                        console.log(images);

                        globalShopResponse = shopResponse;

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
var Aid;
exports.getSrc = (req, res) => {

    MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
        if (err) throw err;

        var dbo = db.db("shopifydbclone");


        var myquery = { id: parseInt(req.params.pid) };

        console.log("id: " + req.params.pid);
        dbo.collection(globalShop).findOne(myquery, function (err, obj) {
            if (err) throw err;

            Aid = obj.badge;


            //res.send(obj.ABid);
            //console.log("product found: " + Aid);
            if (Aid) {
                res.send(Aid);


            }
        });




    });



};
exports.shopdet = (req, res) => {
    const shopRequestUrl = 'https://' + globalShop + '/admin/shop.json';
    const shopRequestHeaders = {
        'X-Shopify-Access-Token': globalToken,
    };
    var shopdetails;

    request.get(shopRequestUrl, { headers: shopRequestHeaders })
        .then((shopResponse) => {
            shopdetails = JSON.parse(shopResponse).shop;

            console.log(shopdetails.id);

            MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
                if (err) throw err;

                var dbo = db.db("shopifydbclone");

                // if (flag == 0) {
                var myquey = { id: shopdetails.id, shopname: shopdetails.name, token: globalToken, currency: shopdetails.currency };

                dbo.collection("shopdetails").insert(myquey, function (err, result) {
                    if (err) throw err;
                    console.log("Number of documents inserted: " + result.insertedCount);
                });


                // }
                res.send({ message: "shopdet copied to DB" });
                db.close();
            });
        }).catch((err) => {
            console.log(err);
            res.send(err);
        });
};
exports.creatscript = (req, res) => {
    // Webhook products/create      
    const Scriptjson = {
        script_tag: {
            event: "onload",
            src: forwardingAddress + "/static/script1.js",

        }
    };

    const Scriptheaders = {
        'X-Shopify-Access-Token': globalToken,
        // 'X-Shopify-Topic': "products/create",
        // 'X-Shopify-Shop-Domain': globalShop,
        'Content-Type': "application/json"
    };

    const webhookUrl = 'https://' + globalShop + '/admin/script_tags.json';

    request.post(webhookUrl, { headers: Scriptheaders, json: Scriptjson })
        .then((response) => {
            console.log(response);
        })
        .catch((error) => {
            if (error) throw error;
        });
}


// Create Webhooks 
exports.createWebhooks = (req, res) => {
    // Webhook products/create      
    const Webhookjson = {
        webhook: {
            topic: "products/create",
            address: forwardingAddress + "/createProduct/" + globalShop,
            format: "json",
        }
    };

    const webhookheaders = {
        'X-Shopify-Access-Token': globalToken,
        // 'X-Shopify-Topic': "products/create",
        // 'X-Shopify-Shop-Domain': globalShop,
        'Content-Type': "application/json"
    };

    const webhookUrl = 'https://' + globalShop + '/admin/webhooks.json';

    request.post(webhookUrl, { headers: webhookheaders, json: Webhookjson })
        .then((webresponse) => {
            console.log(webresponse);
        })
        .catch((error) => {
            if (error) throw error;
        });

    // Webhook products/update      
    const Webhookjson2 = {
        webhook: {
            topic: "products/update",
            address: forwardingAddress + "/updateProduct/" + globalShop,
            format: "json",
        }
    };
    request.post(webhookUrl, { headers: webhookheaders, json: Webhookjson2 })
        .then((webresponse) => {
            console.log(webresponse);
            console.log("inside webhook call");
        })
        .catch((error) => {
            if (error) throw error;
        });
    webhookPCFlag = 1;

    // Webhook products/delete      
    const Webhookjson3 = {
        webhook: {
            topic: "products/delete",
            address: forwardingAddress + "/deleteProduct/" + globalShop,
            format: "json",
        }
    };

    request.post(webhookUrl, { headers: webhookheaders, json: Webhookjson3 })
        .then((webresponse) => {
            console.log(webresponse);
            console.log("inside webhook call products/delete");
        })
        .catch((error) => {
            if (error) throw error;
        });

}
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

exports.copyDB = (req, res) => {
    var flag = 0;
    // console.log("Shop Response: "+globalShopResponse);
    console.log('Entered copyDB');

    var prod_list = JSON.parse(globalShopResponse).products;
    console.log("Products: " + prod_list);

    MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
        if (err) throw err;

        var dbo = db.db("shopifydbclone");

        // if (flag == 0) {
        prod_list.forEach(function (item) {
            dbo.collection(globalShop).insertOne(item, function (err, result) {
                if (err) throw err;
                console.log("Number of documents inserted: " + result.insertedCount);

            });
            flag = 1;
        });

        console.log("before: " + flag);
        if (flag == 1) {
             dbo.collection(globalShop).find({ "variants":{$elemMatch:{"price": { "$exists": true, "$type": 2 } }}}).forEach(function (doc) {
            // bulkUpdateOps = [];

            for (var i = 0; i < doc.variants.length; i++){
                doc.variants[i].price=parseFloat(doc.variants[i].price) ;
                console.log(doc.variants.length);}
                dbo.collection(globalShop).save(doc);
                // var price = "variants.price";
                // for (var i = 0; i < doc.variants.length; i++) {
                // var newPrice = Number(doc.variants[0].price.replace(/[^0-9\.]+/g, ""));
                // if (doc.variants[0].compare_at_price != null) {
                //     var newComparePrice = Number(doc.variants[0].compare_at_price.replace(/[^0-9\.]+/g, ""));
                //     var n = { "$set": { "variants.$[].price": newPrice, "variants.$[].compare_at_price": newComparePrice} }

                // }
                // else {
                //     var n = { "$set": { "variants.$[].price": newPrice, "variants.$[].compare_at_price": newComparePrice} }
                // }


                // // var newPrice = Float(doc.variants[0].price.replace(/[^0-9\.]+/g, ""));
                // console.log("before: " + doc.variants[0].price);
                // console.log("after: " + newPrice);
                // // bulkUpdateOps.push(
                // var q = { "_id": doc._id };

                // // }


                // // );
                // // console.log("push: " + doc.published_at);
                // // console.log(bulkUpdateOps);

                // // if (bulkUpdateOps.length == 1000) {
                // dbo.collection(globalShop).updateMany(q, n, function (err, obj) {
                //     if (err) throw err;
                //     console.log("set newPrice done : " + obj);
                //     // console.log(obj);
                // });
                // bulkUpdateOps = [];
                // }
            });


        }
        // }
        res.send({ message: "Products copied to DB" });
        //db.close();
    });
};


exports.deleteProduct = (req, res) => {
    console.log('Entered deleteProduct');
    var shopname = req.params.shopname;
    console.log(shopname);
    MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
        if (err) throw err;

        var dbo = db.db("shopifydbclone");

        console.log("inside deleteProd");
        var prod_id = parseInt(req.body.id);
        // var myquery = { _id: ObjectId(req.params.id) };
        var myquery = { id: prod_id };

        dbo.collection(shopname).deleteOne(myquery, function (err, obj) {
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
        var shopname = req.params.shopname;
        console.log("---SHOPNAME---");
        console.log(req.params.shopname);
        console.log("---PARAMS----");
        // console.log(req.params);
        var flag = 0;
        // var myquery = { _id: ObjectId(req.params.id) };
        // var prod_id = parseInt(JSON.parse(req).id);
        var prod_id = parseInt(req.body.id);

        // var myquery = { id: parseInt(req.params.id) };
        var myquery = { id: prod_id };
        // console.log("id: " + req.params.id);
        console.log("id: " + prod_id);

        var newvalues = { $set: req.body };
        console.log("req.body:");
        console.log(req.body);

        dbo.collection(shopname).updateOne(myquery, newvalues, function (err, obj) {
            if (err) throw err;
            console.log("product updated:" + obj);

        });
        flag = 1;
        if (flag == 1) {
            var cursor = dbo.collection(globalShop).find({ "variants.0.price": { "$exists": true, "$type": 2 } });
            // bulkUpdateOps = [];

            cursor.forEach(function (doc) {
                // var price = "variants.price";
                // for (var i = 0; i < doc.variants.length; i++) {
                var newPrice = Number(doc.variants[0].price.replace(/[^0-9\.]+/g, ""));

                // var newPrice = Float(doc.variants[0].price.replace(/[^0-9\.]+/g, ""));
                console.log("before: " + doc.variants[0].price);
                console.log("after: " + newPrice);
                // bulkUpdateOps.push(
                var q = { "_id": doc._id };
                var n = { "$set": { "variants.0.price": newPrice } }
                // }


                // );
                // console.log("push: " + doc.published_at);
                // console.log(bulkUpdateOps);

                // if (bulkUpdateOps.length == 1000) {
                dbo.collection(globalShop).updateOne(q, n, function (err, obj) {
                    if (err) throw err;
                    console.log("set newPrice done : " + obj);
                    // console.log(obj);
                });
                // bulkUpdateOps = [];
                // }
            });
        }
        res.send({ message: "Product updated" });
        // db.close();
    });
};

// Create product in our DB when triggered by webhook
exports.createProduct = (req, res) => {
    var flag = 0;
    MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
        if (err) throw err;

        var dbo = db.db("shopifydbclone");

        console.log("inside createProd");
        var shopname = req.params.shopname;
        var myquery = req.body;
        console.log(globalShop);
        dbo.collection(globalShop).insertOne(myquery, function (err, obj) {
            if (err) throw err;
            console.log("product created/added: " + obj.insertedCount);
        });

        flag = 1;
        if (flag == 1) {
            var cursor = dbo.collection(shopname).find({ "variants.0.price": { "$exists": true, "$type": 2 } });
            // bulkUpdateOps = [];

            cursor.forEach(function (doc) {
                // var price = "variants.price";
                // for (var i = 0; i < doc.variants.length; i++) {
                var newPrice = Number(doc.variants[0].price.replace(/[^0-9\.]+/g, ""));

                // var newPrice = Float(doc.variants[0].price.replace(/[^0-9\.]+/g, ""));
                console.log("before: " + doc.variants[0].price);
                console.log("after: " + newPrice);
                // bulkUpdateOps.push(
                var q = { "_id": doc._id };
                var n = { "$set": { "variants.0.price": newPrice } }
                // }


                // );
                // console.log("push: " + doc.published_at);
                // console.log(bulkUpdateOps);

                // if (bulkUpdateOps.length == 1000) {
                dbo.collection(globalShop).updateOne(q, n, function (err, obj) {
                    if (err) throw err;
                    console.log("set newPrice done : " + obj);
                    // console.log(obj);
                });
                // bulkUpdateOps = [];
                // }
            });
        }
        res.send({ message: "Product created/added" });
        // db.close();
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
        dbo.collection(globalShop).findOne(myquery, function (err, obj) {
            if (err) throw err;
            console.log("product found: " + obj);
            res.send(obj);
        });
        // res.send({ message: "Found product" });
        db.close();
    });
};


exports.upload = (req, res) => {

    console.log("api/upload");
    if (!req.file) {
        alert("No file received");
        return res.redirect("http://localhost:4200/");

    } else {
        console.log('file received');
        console.log(req.file.originalname);
        MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
            console.log('upload Pic to mongo');
            var picname = req.file.originalname;
            console.log("pic file name=" + picname);
            // read the img file from tmp in-memory location
            var newImg = fse.readFileSync(req.file.path);
            fse.copySync(req.file.path, 'src/img/' + picname);

            const INPUT_path_to_your_images = 'src/img/*.{jpg,JPG,jpeg,JPEG,png,svg,gif}';
            const OUTPUT_path = 'build/img/';

            compress_images(INPUT_path_to_your_images, OUTPUT_path, { compress_force: false, statistic: true, autoupdate: true }, false,
                { jpg: { engine: 'mozjpeg', command: ['-quality', '60'] } },
                { png: { engine: 'webp', command: ['-q', '60'] } }, //png -> webp
                { svg: { engine: 'svgo', command: '--multipass' } },
                { gif: { engine: 'gif2webp', command: ['-f', '80', '-mixed', '-q', '30', '-m', '2'] } }, function () { }  //gif -> webp
            );
            // encode the file as a base64 string.
            var encImg = newImg.toString('base64');
            // define your new document
            var newItem = {
                contentType: req.file.mimetype,
                size: req.file.size,
                img: Buffer(encImg, 'base64'),
                src: picname,
                default: false // not name, it should be id
            };
            var dbo = db.db("shopifydbclone");
            dbo.collection("badges")
                .insert(newItem, function (err, result) {
                    if (err) { console.log(err); };
                    var newoid = new ObjectId(result.ops[0]._id);
                    fse.remove(req.file.path, function (err) {
                        if (err) { console.log(err) };
                        console.log("uploaded: " + newoid);
                    });
                    res.send(newoid);
                });
            console.log("upload done");

            // return res.redirect("http://localhost:4200/");

        });

    }
};

// exports.uploadPic = (req, res) => {
//     // console.log("Shop Response: "+globalShopResponse);
//     console.log('upload Pic');

//     if (req.file == null) {
//         console.log('upload Pic null');
//         console.log(req.file);
//         // If Submit was accidentally clicked with no file selected...

//     } else {
//         MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
//             console.log('upload Pic to mongo');
//             console.log(req.file.originalname);
//             var picname = req.file.originalname;
//             console.log("pic file name=" + picname);
//             // read the img file from tmp in-memory location
//             var newImg = fse.readFileSync(req.file.path);
//             // encode the file as a base64 string.
//             var encImg = newImg.toString('base64');
//             // define your new document
//             var newItem = {
//                 contentType: req.file.mimetype,
//                 size: req.file.size,
//                 img: Buffer(encImg, 'base64'),
//                 src: '/picture/' + picname // not name, it should be id

//             };
//             var dbo = db.db("shopifydbclone");
//             dbo.collection('shopify_collection2')
//                 .insert(newItem, function (err, result) {
//                     if (err) { console.log(err); };
//                     var newoid = new ObjectId(result.ops[0]._id);
//                     fse.remove(req.file.path, function (err) {
//                         if (err) { console.log(err) };
//                         console.log("uploaded: " + newoid);
//                     });
//                 });

//             dbo.collection("shopify_collection2")
//                 .find({}, { projection: { contentType: 0, size: 0, img: 0, src: 0 } }).toArray(function (err, result) {
//                     if (err) throw err;

//                     images = result;
//                     //var ids = result[0];
//                     var ids = [];
//                     for (var i = 0; i < images.length; i++) {
//                         ids[i] = images[i]._id;
//                     }
//                     console.log(ids);

//                     if (req.url == '/uploadPic/') {

//                         console.log("inside redirection");
//                         res.send({
//                             success: true
//                           })
//                         return res.redirect("http://localhost:4200/badge");
//                     } else {
//                         console.log(req.url)

//                     } 
//                 });

//         });
//     }
// }

exports.getPicture = (req, res) => {
    // assign the URL parameter to a variable
    var filename = req.params.picture;
    // open the mongodb connection with the connection
    // string stored in the variable called url.
    MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
        var dbo = db.db("shopifydbclone");
        dbo.collection('badges')
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

exports.preview = (req, res) => {
    res.render('preview', {
        // id: id
    });
    console.log("id to preview: " + id);
}

var css;
exports.selectProduct = (req, res) => {

    css = req.params.css;
    id = req.params.id;

    console.log(css);
    res.render('selectproducts', { items: "", pids: "" });
    console.log(id);


}

exports.selectProductPage = (req, res) => {
    res.render('selectproducts', { items: "", pids: "" });
}



var id;
exports.selectedBadgeID = (req, res) => {
    id = req.params.id;
    //console.log(id);
}



exports.getProductPriceRange = (req, res) => {
    var myquery;




    var titles = [];
    var variants=[];
    var variants1=[];
    var variants2=[];
    var variants3=[];

    var bids = [];

    var pids = [];
    var tags = [];
    var price = [];
    var created_At = [];
    var isApplied = [];

    // var dbo = db.db("shopifydbclone");

    console.log("inside getProdPrice");
    // var myquery = { _id: ObjectId(req.params.id) };
    // var myquery = { "variants.0.price":{$gte:"100"} };
    p1 = req.params.p1;
    console.log("p1: " + p1);
    p2 = req.params.p2;
    console.log("p2: " + p2);
    // var myquery=req.params.query;

    pr = req.params.pr;
    console.log("pr: " + pr);
    var myquery;
    // var myquery=req.params.query;


    if (pr == "all") {
        myquery = {
           "variants.price":{$gte:parseInt(p1),$lte:parseInt(p2)} 

           

            // "variants": { price: { "$gte": p1, "$lte": p2 } }
        }
    } else if (pr == "withBadges") {
        myquery = {
            "variants.price":{$gte:parseInt(p1),$lte:parseInt(p2)} ,
            "badge":{ $exists: true, $ne: [] }
        }
    } else if (pr == "withoutBadges") {
        myquery = {
            "variants.price":{$gte:parseInt(p1),$lte:parseInt(p2)} ,
            "badge":{ $size: 0 }
        }
    }


    console.log(myquery);

    MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
        if (err) throw err;

        var dbo = db.db("shopifydbclone");
        dbo.collection(globalShop).aggregate([{$project:{_id: 1, title: 1, created_at: 1, tags: 1, "badge.Bid": 1,"variants":1}},{$unwind: "$variants"} ,{$match:myquery}]).toArray(function (err, obj) {
       // dbo.collection(globalShop).find(myquery,{projection:{"variants":  { $elemMatch : { "price":{$gte:parseInt(p1),$lte:parseInt(p2)}} }}}).toArray(function (err, obj) {
            if (err) throw err;
            var products = obj;
            console.log(products);

            //var ids = result[0];

            for (var i = 0; i < products.length; i++) {
                var b = [];
                titles[i] = products[i].title;
                variants1[i]=products[i].variants.option1;
                if(variants1[i]==null){variants1[i]="-";}
                variants2[i]=products[i].variants.option2;
                if(variants2[i]==null){variants2[i]="-";}
                variants3[i]=products[i].variants.option3;
                if(variants3[i]==null){variants3[i]="-";}
                variants[i]=variants1[i]+","+variants2[i]+","+variants3[i];
                variantsId[i]=products[i].variants.id;
                //console.log(products[i].variants.length);
               console.log(variants[i]);
                pids[i] = products[i]._id;
                //var x = products[i].created_at.split("T");
                //created_At[i] = x[0];
                tags[i] = products[i].tags;
                if (products[i].badge&&products[i].badge.length>0) {
                    
                    var j= 0;
                    
                   while(products[i].badge[j]){
                    b[j] =  products[i].badge[j].Bid;
                   // console.log("b",b[j] );
                    j++;

                }
                bids[i] = b;
               // console.log("bids",bids[i] );
                    isApplied[i] = "yes";

               }
            
                 else {
                    isApplied[i] = "no";
                    var j = 0;
                    
                     b[j] = "-";
                    // console.log("b",b[j] );
                     j++;
                     bids[i] = b;
 
                 }
                 
               //  console.log("bids",bids[i] );
              


            }
            console.log("bids",bids );

            res.send({ "items": titles, "pids": pids, "badge": bids, "tags": tags, "created_at": created_At, "isApplied": isApplied ,"variants":variants ,"variantsId":variantsId});


        });


    });

};

exports.getProductDateRange = (req, res) => {
    var myquery;
    var titles = [];
    var bids = [];
    var pids = [];
    var tags = [];
    var price = [];
    var created_At = [];
    var isApplied = [];
    console.log("inside getProdPrice");

    var myquery;
    d1 = req.params.d1;
    console.log("d1: " + d1);
    d2 = req.params.d2;
    console.log("d2: " + d2);
    dr = req.params.dr;
    console.log("dr: " + dr);
    // var myquery=req.params.query;

    if (dr == "all") {
        myquery = {
            "created_at": { "$gte": d1, "$lte": d2 }
        }
    } else if (dr == "withBadges") {
        myquery = {
            "created_at": { "$gte": d1, "$lte": d2 },
            "badge":{ $exists: true, $ne: [] }
        }
    } else if (dr == "withoutBadges") {
        myquery = {
            "created_at": { "$gte": d1, "$lte": d2 },
            "badge":{$not: {$size: 0}}
        }
    }


    console.log(myquery);
    //var queryObj = JSON.parse(myquery);
    //console.log(queryObj); 

    // dbo.collection("shopify_collection").find(myquery, function (err, obj) {
    //     if (err) throw err;

    MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
        if (err) throw err;

        var dbo = db.db("shopifydbclone");
        dbo.collection(globalShop).find(myquery, { projection: { _id: 1, title: 1, created_at: 1, tags: 1, "badge.Bid": 1 } }).toArray(function (err, obj) {
            if (err) throw err;
            var products = obj;
            console.log(obj);

            //var ids = result[0];
            for (var i = 0; i < products.length; i++) {
                var b = [];
                titles[i] = products[i].title;
                pids[i] = products[i]._id;
                var x = products[i].created_at.split("T");
                created_At[i] = x[0];
                tags[i] = products[i].tags;
                if (products[i].badge&&products[i].badge.length>0) {
                    var j= 0;
                    
                   while(products[i].badge[j]){
                    b[j] = products[i].badge[j].Bid;
                    console.log("b",b[j] );
                    j++;

                }
                bids[i] = b;
                console.log("bids",bids[i] );
                    isApplied[i] = "yes";

                }
                else {
                    isApplied[i] = "no";
                    var j = 0;
                    
                     b[j] = "-";
                     console.log("b",b[j] );
                     j++;
                     bids[i] = b;
 
                 }
                 
                 console.log("bids",bids[i] );
              


            }

            res.send({ "items": titles, "pids": pids, "badge": bids, "tags": tags, "created_at": created_At, "isApplied": isApplied });
        });


    })
};

exports.getProductTitle = (req, res) => {
    console.log("inside getProdTitle");
    var myquery;
    var t1 = req.params.t1;
    var tr = req.params.tr;
    var badge = [];
    var thumbnail = [];

    var titles = [];
    var bids = [];
    var pids = [];
    var tags = [];
    var price = [];
    var created_At = [];
    var isApplied = [];
    console.log("t1: " + t1);
    console.log("tr: " + tr);
    var t;

    //    var t = "/"+t1+"/i";
    if (tr == "all") {
        myquery = {
            'title': new RegExp(t1, 'i')
        }
    } else if (tr == "withBadges") {
        myquery = {
            'title': new RegExp(t1, 'i'),
            "badge":{ $exists: true, $ne: [] }
        }
    } else if (tr == "withoutBadges") {
        myquery = {
            'title': new RegExp(t1, 'i'),
            'badge': { $exists: false }
        }
    }
    MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
        if (err) throw err;

        var dbo = db.db("shopifydbclone");
        dbo.collection(globalShop).find(myquery, { projection: { _id: 1, title: 1, created_at: 1, tags: 1, "badge.Bid": 1 } }).toArray(function (err, obj) {
            if (err) throw err;
            var products = obj;

            //var ids = result[0];

            for (var i = 0; i < products.length; i++) {
                var b = [];
                titles[i] = products[i].title;
                pids[i] = products[i]._id;
                var x = products[i].created_at.split("T");
                created_At[i] = x[0];
                tags[i] = products[i].tags;
                if (products[i].badge&&products[i].badge.length>0) {
                    var j= 0;
                    
                   while(products[i].badge[j]){
                    b[j] =  products[i].badge[j].Bid;
                    console.log("b",b[j] );
                    j++;

                }
                bids[i] = b;
                console.log("bids",bids[i] );
                    isApplied[i] = "yes";

                }
                else {
                    isApplied[i] = "no";
                    var j = 0;
                    
                     b[j] = "-";
                     console.log("b",b[j] );
                     j++;
                     bids[i] = b;
 
                 }
                 
                 console.log("bids",bids[i] );
              


            }

            console.log("src:" + badge);

            res.send({ "items": titles, "pids": pids, "badge": bids, "tags": tags, "created_at": created_At, "isApplied": isApplied });
        });


    })


}



exports.getProductTag = (req, res) => {

    var myquery;
    var t1 = req.params.t1;
    var tr = req.params.tr;
    var badge = [];
    var thumbnail = [];

    var titles = [];
    var bids = [];
    var pids = [];
    var tags = [];
    var price = [];
    var created_At = [];
    var isApplied = [];
    // var dbo = db.db("shopifydbclone");

    console.log("inside getProdTitle");
    // var myquery = { _id: ObjectId(req.params.id) };
    // var myquery = { "variants.0.price":{$gte:"100"} };
    var myquery;
    var tg1 = req.params.tg1;
    var tr = req.params.tr;
    console.log("tg1: " + tg1);
    console.log("tr: " + tr);
    //    var t = "/"+t1+"/i";
    if (tr == "all") {
        myquery = {
            'tags': new RegExp(tg1, 'i')
        }
    } else if (tr == "withBadges") {
        myquery = {
            'tags': new RegExp(tg1, 'i'),
            "badge":{ $exists: true, $ne: [] }
        }
    } else if (tr == "withoutBadges") {
        myquery = {
            'tags': new RegExp(tg1, 'i'),
            'badge': { $exists: false }
        }
    }

    //  var myquery ={"title" :t};
    //  console.log(myquery);   
    //var queryObj = JSON.parse(myquery);
    //console.log(queryObj); 

    // dbo.collection("shopify_collection").find(myquery, function (err, obj) {
    //     if (err) throw err;
    MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
        if (err) throw err;

        var dbo = db.db("shopifydbclone");
        dbo.collection(globalShop).find(myquery, { projection: { _id: 1, title: 1, created_at: 1, tags: 1, "badge.Bid": 1 } }).toArray(function (err, obj) {
            if (err) throw err;
            var products = obj;

            //var ids = result[0];
            for (var i = 0; i < products.length; i++) {
                var b = [];
                titles[i] = products[i].title;
                pids[i] = products[i]._id;
                var x = products[i].created_at.split("T");
                created_At[i] = x[0];
                tags[i] = products[i].tags;
                if (products[i].badge&&products[i].badge.length>0) {
                    var j= 0;
                    
                   while(products[i].badge[j]){
                    b[j] = products[i].badge[j].Bid;
                    console.log("b",b[j] );
                    j++;

                }
                bids[i] = b;
                console.log("bids",bids[i] );
                    isApplied[i] = "yes";

                }
                else {
                    isApplied[i] = "no";
                    var j = 0;
                    
                     b[j] = "-";
                     console.log("b",b[j] );
                     j++;
                     bids[i] = b;
 
                 }
                 
                 console.log("bids",bids[i] );
              


            }

            res.send({ "items": titles, "pids": pids, "badge": bids, "tags": tags, "created_at": created_At, "isApplied": isApplied });


        });


    })
};

exports.publishBadges = (req, res) => {

    var map = 0;
    var abid;
    console.log('body: ' + JSON.stringify(req.body));
    console.log(req.body.bid);
    res.send(req.body);
    MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
        if (err) throw err;

        var dbo = db.db("shopifydbclone");


        // if (flag == 0) {


            var newvalues = { $push: { "badge":  { Bid: req.body.bid, x: req.body.xvalue, y: req.body.yvalue, opvalue: req.body.opval } } };

       


        for (var i = 0; i < req.body.pid.length; i++) {
            var myquery = {
                "_id": ObjectId(req.body.pid[i])
            };
            console.log("pids: " + req.body.pid[i]);

            dbo.collection(globalShop).updateOne(myquery, newvalues, function (err, obj) {
                if (err) throw err;
                console.log("product updated ABid: " + obj);
            });
        }


    });
};


exports.unpublishBadges = (req, res) => {

    MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
        if (err) throw err;

        var dbo = db.db("shopifydbclone");
        console.log("response result");

        console.log(req.body.pid);

        for (var i = 0; i < req.body.pid.length; i++) {
            var myquery = {
                "_id": ObjectId(req.body.pid[i].prodid)
            };
            var badges = [];
            for(var j =0;j<req.body.pid[i].bid.length;j++){
                console.log(req.body.pid[i].bid[j]);

            var newvalues = { $pull: { "badge": { Bid: req.body.pid[i].bid[j] } } };

            dbo.collection(globalShop).updateOne(myquery, newvalues, function (err, obj) {
                if (err) throw err;
                console.log("removed badge from product: " + obj);
            });
        }
        }


    });
};

exports.getIDS = (req, res) => {
    console.log("inside get IDS");
    MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
        var dbo = db.db("shopifydbclone");
        dbo.collection("badges").find({ default: true }, { projection: { _id: 1 } }).toArray(function (err, result) {
            if (err) throw err;

            images = result;
            //var ids = result[0];
            var ids = [];
            for (var i = 0; i < images.length; i++) {
                ids[i] = images[i]._id;
            }

            //    console.log(images[0]._id);
            console.log(ids);
            res.send(ids);
            // return ids;
        });
    });
}

exports.getUserIDS = (req, res) => {
    console.log("inside get User IDS");
    MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
        var dbo = db.db("shopifydbclone");
        dbo.collection("badges").find({ default: false }, { projection: { _id: 1 } }).toArray(function (err, result) {
            if (err) throw err;

            images = result;
            //var ids = result[0];
            var ids = [];
            for (var i = 0; i < images.length; i++) {
                ids[i] = images[i]._id;
            }

            //    console.log(images[0]._id);
            console.log(ids);
            res.send(ids);
            // return ids;
        });
    });
}


exports.deleteBadge = (req, res) => {
    console.log('Entered delete badge');
    MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
        if (err) throw err;
        var dbo = db.db("shopifydbclone");
        var myquery = { _id: ObjectId(req.body.id) };
        console.log(myquery);
        dbo.collection("badges").deleteOne(myquery, function (err, obj) {
            if (err) throw err;
            if (obj.deletedCount) {
                // console.log(obj);
                res.send(true);
            }
            else {
                res.send(false);
            }
        });
    });
};

exports.tags = (req, res) => {
    MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
        if (err) throw err;
        var dbo = db.db("shopifydbclone");

        dbo.collection(globalShop).find({}, { projection: { tags: 1 } }).toArray(function (err, obj) {
            if (err) throw err;



            var products = obj;
            console.log(obj);
            //var ids = result[0];

            var tagsArray = [];
            for (var i = 0; i < products.length; i++) {
                tagsArray.push(products[i].tags);
            }

            //var ids = result[0];



            console.log("tags: " + tagsArray);
            //console.log("product found: " + );
            // res.send(obj);
            // res.render('selectproducts', { items: titles, pids: pids });
            res.send(tagsArray);
        });
    });
};

exports.currency = (req, res) => {
    MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
        if (err) throw err;
        var dbo = db.db("shopifydbclone");
        var dbshop = globalShop.split('.');
        console.log(dbshop[0]);

        // dbo.collection("shopdetails").find({shopname : "tricon-jewel-store" },{projection:{currency:1}},function (err, obj) {
        dbo.collection("shopdetails").find({ shopname: dbshop[0] }, { projection: { currency: 1 } }).toArray(function (err, obj) {
            if (err) throw err;
            console.log('obj');
            console.log(obj);

            var cur = obj[0].currency;
            console.log("cur" + cur);
            //var ids = result[0];


            //console.log("product found: " + );
            // res.send(obj);
            // res.render('selectproducts', { items: titles, pids: pids });
            res.send(obj);
        });
    });
};


