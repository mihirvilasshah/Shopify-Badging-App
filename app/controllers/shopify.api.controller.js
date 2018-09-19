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
                        MongoClient.connect(url, function (err, db) {
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


                                    res.render('selectbadge', {
                                        apiKey: process.env.SHOPIFY_API_KEY,
                                        shopOrigin: 'https://' + globalShop,
                                        ids: ids,
                                        lids: lids,


                                        forwardingAddress: process.env.FORWARDING_ADDRESS
                                    });

                                });
                            });

                            // //
                            //                             // dbo.collection('shopify_collection2')
                            //                             //     .find({}, function (err, results) {


                            //                             //         results.forEach(function (result) {

                            //                             //             images.push(result.img.buffer);
                            //                             //         })
                            //                             //     });

                            //                                 //
                        });

                        //console.log(images);


                        //  res.redirect('/static/welcome.html');
                        console.log(images);
                        //res.render('index.html');
                        // console.log("Shop Response: "+shopResponse);
                        globalShopResponse = shopResponse;
                        // console.log("Global Shop Response: "+globalShopResponse);

                        // res.sendFile("../../client/src/index.html");
                        // res.redirect('/angular/src/index.html');

                        // copyDB(); //using func
                        // TODO: Make sure that DB copying is only done once
                        // API call to copy Shopify DB ton our DB


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
            dbo.collection(globalShop).insertOne(item, function (err, result) {
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

    } else {
        MongoClient.connect(url, function (err, db) {
            console.log('upload Pic to mongo');
            console.log(req.file.originalname);
            var imname = req.file.originalname;
            // read the img file from tmp in-memory location
            var newImg = fs.readFileSync(req.file.path);
            // encode the file as a base64 string.
            var encImg = newImg.toString('base64');
            // define your new document
            var newItem = {
                contentType: req.file.mimetype,
                size: req.file.size,
                img: Buffer(encImg, 'base64'),
                // src: forwardingAddress + '/picture/' + imname // not name, it should be id
                default: false

            };
            var dbo = db.db("shopifydbclone");
            dbo.collection('badges')
                .insert(newItem, function (err, result) {
                    if (err) { console.log(err); };
                    var newoid = new ObjectId(result.ops[0]._id);
                    fs.remove(req.file.path, function (err) {
                        if (err) { console.log(err) };

                        // var img = document.createElement("IMG");
                        // img.setAttribute("src", forwardingAddress + '/picture/' + newoid);

                        // res.render('selectbadge', { src: forwardingAddress + '/picture/' + newoid });

                        //res.send("Img can be viewed at: " + forwardingAddress + '/picture/' + newoid);
                        console.log("uploaded: " + newoid);
                    });
                });

            dbo.collection("badges")
                .find({ "default": false }, { projection: { contentType: 0, size: 0, img: 0 } }).toArray(function (err, result) {
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


                        res.render('selectbadge', {
                            apiKey: process.env.SHOPIFY_API_KEY,
                            shopOrigin: 'https://' + globalShop,
                            ids: ids,
                            lids: lids,


                            forwardingAddress: process.env.FORWARDING_ADDRESS
                        });

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
        id: id
    });
    console.log("id to preview: " + id);
}

var css;
exports.selectProduct = (req, res) => {

    css = req.params.css;
    id = req.params.id;

    console.log(css);
    // MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
    //     if (err) throw err;

    //     var dbo = db.db("shopifydbclone");
    //     var myquery = { Bid: id, css: css };

    //     // if (flag == 0) {

    //     dbo.collection("badge_Product_mapping").insertOne(myquery, function (err, result) {
    //         if (err) throw err;
    //         console.log("inserted to badge_Product_mapping ");
    //         var newoid = new ObjectId(result.ops[0]._id);
    //         console.log("ABid: " + newoid);
    //     });


    //     dbo.collection("shopify_collection").find({
    //         "_id": {
    //             "$in":
    //             [ObjectId("55880c251df42d0466919268"),
    //             ObjectId("55bf528e69b70ae79be35006")
    //             ]
    //         }
    //     });


    //     // }
    //     // res.send({ message: "Products copied to DB" });
    //     db.close();
    // });
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
        pr = req.params.pr;
        var myquery;
        // var myquery=req.params.query;

        if (pr == "all") {
            myquery = {
                "variants.0.price": { "$gte": p1, "$lte": p2 }
            }
        } else if (pr == "withBadges") {
            myquery = {
                "variants.0.price": { "$gte": p1, "$lte": p2 },
                "ABid": { $exists: true }
            }
        } else if (pr == "withoutBadges") {
            myquery = {
                "variants.0.price": { "$gte": p1, "$lte": p2 },
                "ABid": { $exists: false }
            }
        }

        console.log(myquery);
        //var queryObj = JSON.parse(myquery);
        //console.log(queryObj); 

        // dbo.collection("shopify_collection").find(myquery, function (err, obj) {
        //     if (err) throw err;

        dbo.collection("shopify_collection").find(myquery, { projection: { _id: 1, title: 1 } }).toArray(function (err, obj) {
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

            console.log("product found: " + titles);
            //console.log("product found: " + );
            // res.send(obj);
            res.render('selectproducts', { items: titles, pids: pids });
        });
        // res.send({ message: "Found product" });

    });
};
exports.getProductDateRange = (req, res) => {
    MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
        if (err) throw err;

        var dbo = db.db("shopifydbclone");

        console.log("inside getProdPrice");
        // var myquery = { _id: ObjectId(req.params.id) };
        // var myquery = { "variants.0.price":{$gte:"100"} };
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

        dbo.collection("shopify_collection").find(myquery, { projection: { _id: 1, title: 1 } }).toArray(function (err, obj) {
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

            console.log("product found: " + titles);
            //console.log("product found: " + );
            // res.send(obj);
            res.render('selectproducts', { items: titles, pids: pids });
        });
        // res.send({ message: "Found product" });

    });
};

exports.getProductTitle = (req, res) => {
    MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
        if (err) throw err;

        var dbo = db.db("shopifydbclone");

        console.log("inside getProdPrice");
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

        dbo.collection("shopify_collection").find(myquery, { projection: { _id: 1, title: 1 } }).toArray(function (err, obj) {
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

            console.log("product found: " + titles);
            //console.log("product found: " + );
            // res.send(obj);
            res.render('selectproducts', { items: titles, pids: pids });
        });
        // res.send({ message: "Found product" });

    });
};
exports.ajaxtest = (req, res) => {

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

            // console.log("asfas" + myquery._id);
            // abid = myquery._id;

            var newvalues = { $set: { "ABid": newoid } };


            for (var i = 0; i < req.body.pid.length; i++) {
                var myquery = {
                    "_id": ObjectId(req.body.pid[i])
                };
                console.log("pids: " + req.body.pid[i]);

                dbo.collection("shopify_collection").updateOne(myquery, newvalues, function (err, obj) {
                    if (err) throw err;
                    console.log("product updated ABid: " + obj);
                });
            }
            // map = 1;
        });

        // console.log("map:"+map);

        // var x = ObjectId(req.body.pid[0]) + ",";
        // for (var i = 1; i < req.body.pid.length; i++) {
        //     x += ObjectId(req.body.pid[i]) + ",";
        // }

        // console.log("x: " + x);

        // var myquery = {
        //     "_id": {
        //         "$in":

        //             [
        //                 x
        //             ]
        //     }
        // };






        // }
        // res.send({ message: "Products copied to DB" });

    });

    // if (map == 1) {





    // }

};


exports.withoutBadge = (req, res) => {


    MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
        if (err) throw err;
        var titles = [];
        var pids = [];

        var dbo = db.db("shopifydbclone");

        for (var i = 0; i < req.body.pid.length; i++) {
            var myquery = {
                "_id": ObjectId(req.body.pid[i]),
                "ABid": { $exists: true }
            };
            console.log(myquery);
            console.log("pids: " + req.body.pid[i]);

            dbo.collection("shopify_collection").findOne(myquery, { projection: { _id: 1, title: 1 } }, function (err, obj) {
                if (err) throw err;

                console.log("product without ABid: ");
                console.log(obj);
                if (obj != null) {
                    titles.push(obj.title);
                    console.log(titles);
                    pids.push(obj._id);
                }

                // console.log(obj);
            });
        }

        // res.render('selectproducts', { items: titles, pids: pids });

    });


    var titlesStr = JSON.stringify(titles);
    console.log("titleStr: " + titles);
    var pidsStr = JSON.stringify(pids);

    res.send({ items: titlesStr, pids: pidsStr });

};

// exports.withoutBadge = (req, res) => {
//     var titles = [];
//     var pids = [];

//     MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
//         if (err) throw err;

//         var dbo = db.db("shopifydbclone");

//         for (var i = 0; i < req.params.pids.length; i++) {
//             var myquery = {
//                 "_id": ObjectId(req.params.pids[i]),
//                 "ABid": { $exists: true }
//             };
//             console.log(myquery);
//             console.log("pids: " + req.params.pids[i]);

//             dbo.collection("shopify_collection").findOne(myquery,{ projection: { _id: 1, title: 1 } }, function (err, obj) {
//                 if (err) throw err;

//                 console.log("product without ABid: ");
//                 console.log(obj);
//                 if (obj != null) {
//                     titles.push(obj.title);
//                     pids.push(obj._id);
//                 }

//                 // console.log(obj);
//             });
//         }
//         res.render('selectproducts', { items: titles, pids: pids });
//     });

// };





