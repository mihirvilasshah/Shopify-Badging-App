const dotenv = require('dotenv').config();
const express = require('express');
const app = express();
const crypto = require('crypto');
const cookie = require('cookie');
const nonce = require('nonce')();
const querystring = require('querystring');
const request = require('request-promise');

//TODO: change the location to store the token, use redis or any other DB. or use session.
var globalToken = undefined;
var gloablShop = undefined;
var glShop = undefined;


//import React from 'react';  //TRY
//const React = require(react) //
//import {JsonTable} from 'react-json-to-html';   //TRY
//const JsonTable = require('react-json-to-html') //

const bodyparser = require('body-parser');
app.use(bodyparser.json());

const apiKey = process.env.SHOPIFY_API_KEY;
const apiSecret = process.env.SHOPIFY_API_SECRET;
const scopes = 'read_products';
const forwardingAddress = "https://7470d176.ngrok.io"; // Replace this with your HTTPS Forwarding address

app.get('/', (req, res) => {
  res.send('Hello World! from TRICON BADGER');
});

app.listen(3000, () => {
  console.log('Example app listening on port 3000!');
});

app.use('/static', express.static('public'));

// localhost:3000/shopify?shop=triconbadger.myshopify.com

app.get('/shopify', (req, res) => {
  const shop = req.query.shop;
  if (shop) {
    const state = nonce();
    const redirectUri = forwardingAddress + '/shopify/callback';
    //const redirectUri = ()=>'$(forwardingAddress)/shopify/callback';
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
});

app.get('/shopify/callback', (req, res) => {
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
        globalShop  = shop;
        // TODO
        // Use access token to make API call to 'shop' endpoint
        const shopRequestUrl = 'https://' + shop + '/admin/products.json';
        const shopRequestHeaders = {
          'X-Shopify-Access-Token': globalToken,
        };

        request.get(shopRequestUrl, { headers: shopRequestHeaders })
          .then((shopResponse) => {
            // res.send(
            //     '<script>alert("Welcome to Tricon Badger!!!")</script>'

            //         // '<script>alert(
            //         //     "This is an alert with basic formatting\n\n"
            //         //     + "\t• list item 1\n" 
            //         //     + "\t• list item 2\n"
            //         //     + "\t• list item 3\n\n" 
            //         //     + "▬▬▬▬▬▬▬▬▬ஜ۩۞۩ஜ▬▬▬▬▬▬▬▬▬\n\n"
            //         //     + "Simple table\n\n" 
            //         //     + "Char\t| Result\n" 
            //         //     + "\\n\t| line break\n" 
            //         //     + "\\t\t| tab space"
            //         // )</script>'

            //     //"Hi, Welcome!!!"
            //     );

            res.redirect('/static/welcome.html');

            // class Nested extends React.Component {

            //   render() {
            //     return (
            //       <JsonTable shopResponse={json} />
            //     )
            //   }
            // }


            //var query = shopResponse.body;
            //res.end(query);
            console.log(shopResponse);
            glShop=shopResponse;
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
});


app.get('/product', (req, res) => {

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

});


//------------------------------ mongoDB connection ------------------------------
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

// Use connect method to connect to the server
MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("shopify");
  var myobj = JSON.parse(gl);
  dbo.collection("product").insertMany(myobj, function(err, res) {
    if (err) throw err;
    console.log("Number of documents inserted: " + res.insertedCount);  
})
// dbo.collection("product").find({}).toArray(function(err, result) {
//   if (err) throw err;
//   // console.log(result);
 
// });
db.close();
});