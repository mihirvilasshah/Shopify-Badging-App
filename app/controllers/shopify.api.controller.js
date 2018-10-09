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

const scopes = 'read_products';
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

        MongoClient.connect(url, function (err, db) {
            var dbo = db.db("shopifydbclone");
            dbo.listCollections({ name: shop })
                .next(function (err, collinfo) {
                    if (!collinfo) {

                        res.redirect(installUrl);
                    }
                    else {

                        res.redirect(appUrl);
                    }
                });
        });
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

                // Use access token to make API call to 'shop' endpoint
                const shopRequestUrl = 'https://' + shop + '/admin/products.json';
                const shopRequestHeaders = {
                    'X-Shopify-Access-Token': globalToken,
                };

                request.get(shopRequestUrl, { headers: shopRequestHeaders })
                    .then((shopResponse) => {

                        console.log("Token: " + globalToken);
                        request.get(forwardingAddress + '/shopdet');

                        MongoClient.connect(url, function (err, db) {
                            var dbo = db.db("shopifydbclone");
                            dbo.listCollections({ name: globalShop })
                                .next(function (err, collinfo) {
                                    if (!collinfo) {
                                        request.get(forwardingAddress + '/copyDB');
                                        request.get(forwardingAddress + '/createWebhooks');
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
    
            console.log("inside getProd");
            
            var myquery = { id: parseInt(req.params.pid) };
           
            console.log("id: " + req.params.pid);
            dbo.collection(globalShop).findOne(myquery, function (err, obj) {
                if (err) throw err;
                console.log("product Aid " + obj.ABid);
                Aid = obj.ABid;
               
                //res.send(obj.ABid);
                //console.log("product found: " + Aid);
                if(Aid){
                    var myquery1 = { _id: Aid };               
                
                    dbo.collection("badge_Product_mapping").findOne(myquery1, function (err, obj) {
                        if (err) throw err;
                        console.log("product badge found: " + obj.Bid);
                        //id = obj.title;
                       
                        res.send(obj);
                    });
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
                var myquey = { id: shopdetails.id, shopname: shopdetails.name, token: globalToken };

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
        'X-Shopify-Access-Token': process.env.TOKEN,
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
            var cursor = dbo.collection(globalShop).find({ "variants.0.price": { "$exists": true, "$type": 2 } });
            // bulkUpdateOps = [];

            cursor.forEach(function (doc) {
                // var price = "variants.price";
                // for (var i = 0; i < doc.variants.length; i++) {
                var newPrice = Number(doc.variants[0].price.replace(/[^0-9\.]+/g, ""));
                if (doc.variants[0].compare_at_price != null) {
                    var newComparePrice = Number(doc.variants[0].compare_at_price.replace(/[^0-9\.]+/g, ""));
                    var n = { "$set": { "variants.0.price": newPrice, "variants.0.compare_at_price": newComparePrice } }

                }
                else {
                    var n = { "$set": { "variants.0.price": newPrice, "variants.0.compare_at_price": newPrice } }
                }


                // var newPrice = Float(doc.variants[0].price.replace(/[^0-9\.]+/g, ""));
                console.log("before: " + doc.variants[0].price);
                console.log("after: " + newPrice);
                // bulkUpdateOps.push(
                var q = { "_id": doc._id };

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
        var flag = 0;
        // var myquery = { _id: ObjectId(req.params.id) };
        // var prod_id = parseInt(JSON.parse(req).id);
        var prod_id = parseInt(req.body.id);

        // var myquery = { id: parseInt(req.params.id) };
        var myquery = { id: prod_id };
        // console.log("id: " + req.params.id);
        console.log("id: " + prod_id);

        var newvalues = { $set: req.body };

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
    MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
        if (err) throw err;

        var dbo = db.db("shopifydbclone");

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
                "variants.0.price": { "$gte": parseInt(p1), "$lte": parseInt(p2) },
                // "variants": { price: { "$gte": p1, "$lte": p2 } }
            }
        } else if (pr == "withBadges") {
            myquery = {
                "variants.0.price": { "$gte": parseInt(p1), "$lte": parseInt(p2) },
                "ABid": { $exists: true }
            }
        } else if (pr == "withoutBadges") {
            myquery = {
                "variants.0.price": { "$gte": parseInt(p1), "$lte": parseInt(p2) },
                "ABid": { $exists: false }
            }
        }
        

        console.log(myquery);
        //var queryObj = JSON.parse(myquery);
        //console.log(queryObj); 

        // dbo.collection("shopify_collection").find(myquery, function (err, obj) {
        //     if (err) throw err;

        dbo.collection(globalShop).find(myquery, { projection: { _id: 1, title: 1, ABid: 1 } }).toArray(function (err, obj) {
            if (err) throw err;




            var products = obj;
            //var ids = result[0];

            var titles = [];
            for (var i = 0; i < products.length; i++) {
                titles[i] = products[i].title;
            }

            var pids = [];
            for (var i = 0; i < products.length; i++) {
                pids[i] = products[i]._id;
                // console.log(pids[i]);
            }
            var badge = [];
            for (var i = 0; i < products.length; i++) {
                console.log(products[i].ABid);
                if( products[i].ABid){
                    badge[i] = "yes";
                    
                }
                else{
                    badge[i] = "no";
                }
              
            }

            console.log("product found: " + titles);
            //console.log("product found: " + );
            // res.send(obj);
            // res.render('selectproducts', { items: titles, pids: pids });
            res.send({ "items": titles, "pids": pids, "badge": badge });
        });
        // res.send({ message: "Found product" });

    });
};

exports.getProductDateRange = (req, res) => {
    MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
        if (err) throw err;

        var dbo = db.db("shopifydbclone");

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
                "ABid": { $exists: true }
            }
        } else if (dr == "withoutBadges") {
            myquery = {
                "created_at": { "$gte": d1, "$lte": d2 },
                "ABid": { $exists: false }
            }
        }
        

        console.log(myquery);
        //var queryObj = JSON.parse(myquery);
        //console.log(queryObj); 

        // dbo.collection("shopify_collection").find(myquery, function (err, obj) {
        //     if (err) throw err;

        dbo.collection(globalShop).find(myquery, { projection: { _id: 1, title: 1, ABid: 1 } }).toArray(function (err, obj) {
            if (err) throw err;

            var products = obj;
            //var ids = result[0];

            var titles = [];
            for (var i = 0; i < products.length; i++) {
                titles[i] = products[i].title;
            }

            var pids = [];
            for (var i = 0; i < products.length; i++) {
                pids[i] = products[i]._id;
                // console.log(pids[i]);
            }
            var badge = [];
            for (var i = 0; i < products.length; i++) {
                if( products[i].ABid){
                    badge[i] = "yes";
                }
                else{
                    badge[i] = "no";
                }
              
            }

            console.log("product found: " + titles);
            //console.log("product found: " + );
            // res.send(obj);
            // res.render('selectproducts', { items: titles, pids: pids });
            res.send({ "items": titles, "pids": pids, "badge": badge  });
        });
        // res.send({ message: "Found product" });

    });
};

exports.getProductTitle = (req, res) => {
    MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
        if (err) throw err;

        var dbo = db.db("shopifydbclone");

        console.log("inside getProdTitle");
        // var myquery = { _id: ObjectId(req.params.id) };
        // var myquery = { "variants.0.price":{$gte:"100"} };
        var myquery;
        var t1 = req.params.t1;
        var tr = req.params.tr;
        console.log("t1: " + t1);
        console.log("tr: " + tr);
        //    var t = "/"+t1+"/i";
        if (tr == "all") {
            myquery = {
                'title': new RegExp(t1, 'i')
            }
        } else if (tr == "withBadges") {
            myquery = {
                'title': new RegExp(t1, 'i'),
                'ABid': { $exists: true }
            }
        } else if (tr == "withoutBadges") {
            myquery = {
                'title': new RegExp(t1, 'i'),
                'ABid': { $exists: false }
            }
        }

        //  var myquery ={"title" :t};
        //  console.log(myquery);   
        //var queryObj = JSON.parse(myquery);
        //console.log(queryObj); 

        // dbo.collection("shopify_collection").find(myquery, function (err, obj) {
        //     if (err) throw err;

        dbo.collection(globalShop).find(myquery, { projection: { _id: 1, title: 1, ABid: 1 } }).toArray(function (err, obj) {
            if (err) throw err;




            var products = obj;
            //var ids = result[0];

            var titles = [];
            for (var i = 0; i < products.length; i++) {
                titles[i] = products[i].title;
            }

            var pids = [];
            for (var i = 0; i < products.length; i++) {
                pids[i] = products[i]._id;
                // console.log(pids[i]);
            }

            // var prod = [];
            // for (var i = 0; i < products.length; i++) {
            //     prod[i] = {"pid":products[i]._id,"title":products[i].title};
            // }
            var badge = [];
            for (var i = 0; i < products.length; i++) {
                if( products[i].ABid){
                    badge[i] = "yes";
                }
                else{
                    badge[i] = "no";
                }
              
            }

            console.log("product found: " + titles);
            //console.log("product found: " + );
            // res.send(obj);
            // res.render('selectproducts', { items: titles, pids: pids });
            // res.send(prod);
            res.send({ "items": titles, "pids": pids, "badge": badge });
        });
        // res.send({ message: "Found product" });

    });
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
        var myquery = { Bid: req.body.bid, css: req.body.css };

        // if (flag == 0) {

        dbo.collection("badge_Product_mapping").insertOne(myquery, function (err, result) {
            if (err) throw err;
            console.log("inserted to badge_Product_mapping ");

            var newoid = new ObjectId(result.ops[0]._id);
            console.log("ABid: " + newoid);

            var newvalues = { $set: { "ABid": newoid } };


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
    });
};

exports.unpublishBadges = (req, res) => {

    MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
        if (err) throw err;

        var dbo = db.db("shopifydbclone");

        // console.log(req.body.pid);

        for (var i = 0; i < req.body.pid.length; i++) {
            var myquery = {
                "_id": ObjectId(req.body.pid[i])
            };
            console.log("pids: " + req.body.pid[i]);
            var newvalues = { $unset: { "ABid": 1 } };

            dbo.collection(globalShop).updateOne(myquery, newvalues, function (err, obj) {
                if (err) throw err;
                console.log("removed ABid from product: " + obj);
            });
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
        var myquery = { _id: ObjectId(req.body.id)};
        console.log(myquery);
        dbo.collection("badges").deleteOne(myquery, function (err, obj) {
            if (err) throw err;
            if( obj.deletedCount){
                console.log(obj);
                res.send(true);
            }
            else{
                res.send(false);
            }
        });
    });
};



