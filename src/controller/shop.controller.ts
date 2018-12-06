// import * as express from 'express';
import { doesNotReject } from 'assert';
import { Request, Response } from 'express';
import { Db, MongoClient } from 'mongodb';
import path = require('path');
import APP_CONFIG from '../config/app_config';

const requestp = require('request-promise');

const http = require('http');
const querystring = require('querystring');
const reqPromise = require('request-promise');
const nonce = require('nonce')();
const cookie = require('cookie');
const crypto = require('crypto');
const fs = require('fs');
// const AWS = require('aws-sdk');
// const s3 = new AWS.S3({
//   accessKeyId: process.env.AWS_ACCESS_KEY,
//   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//   region: process.env.S3_REGION
// });
const S3 = require('../DAO/S3connection');
const apiKey = APP_CONFIG.SHOPIFY_API_KEY;
const apiSecret = process.env.SHOPIFY_API_SECRET;
const scopes =
  'read_products,read_script_tags,write_script_tags,read_themes,write_themes';
const forwardingAddress = 'https://02a8f059.ngrok.io';
const serverUrl = 'mongodb://localhost:27017';
const badgeDB = 'TriconBadgeApp';
const myBucket = 'anumula';
const mongoClient = require('mongodb').MongoClient;
let storeName: any;
let storeToken: any;
const fileName = 'object.json';

/*Logic to handle badge app installation*/
export function handleAppInstall(request: Request, response: Response): any {
  console.log('Inside shopify main method controller');
  const shop = (storeName = request.query.shop);
  if (shop) {
    const state = nonce();
    const redirectUri = forwardingAddress + '/tricon/shopify/authorizeCallback';
    const installUrl =
      'https://' +
      shop +
      '/admin/oauth/authorize?client_id=' +
      apiKey +
      '&scope=' +
      scopes +
      '&state=' +
      state +
      '&redirect_uri=' +
      redirectUri;
    response.cookie('state', state);
    response.redirect(installUrl);
  } else {
    return response.status(400).send(
      `Missing shop parameter. Please add ?
        shop=your-development-shop.myshopify.com to your request`
    );
  }
}

export function authorizeShopifyRequest(
  request: Request,
  response: Response
): any {
  // downloadFile('download.json');
  console.log('Inside shopify request authorize method controller');
  const { shop, hmac, code, state } = request.query;
  const stateCookie = cookie.parse(request.headers.cookie).state;

  if (state !== stateCookie) {
    return response.status(403).send('Request origin cannot be verified');
  }

  if (shop && hmac && code) {
    console.log('invoke validate');
    this.validateRequestOrigin(request, response);
  } else {
    response.status(400).send('Required parameters missing');
  }
}

/** Validates if the request has come from Shopify */
export function validateRequestOrigin(
  request: Request,
  response: Response
): any {
  console.log('in validate request origin');
  const { shop, hmac, code, state } = request.query;
  const map = { ...request.query };
  delete map.signature;
  delete map.hmac;
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

  try {
    hashEquals = crypto.timingSafeEqual(generatedHash, providedHmac);
  } catch (e) {
    hashEquals = false;
  }

  if (hashEquals) {
    this.generateStoreAccessToken(request, response, shop, code);
  } else {
    return response.status(400).send('HMAC validation failed');
  }
}

/** Get merchant's store access token and make call to store Store's data into DB */
export async function generateStoreAccessToken(
  request: Request,
  response: Response,
  shop: string,
  code: any
) {
  /*Exchange temporary code for a permanent access token*/
  const shopAccessToken = '';
  // const self = this;
  const accessTokenRequestUrl = 'https://' + shop + '/admin/oauth/access_token';
  console.log('url is ' + accessTokenRequestUrl);
  const accessTokenPayload = {
    client_id: apiKey,
    client_secret: apiSecret,
    code
  };
  const reqOptions = {
    method: 'POST',
    uri: accessTokenRequestUrl,
    body: accessTokenPayload,
    json: true
  };

  try {
    const accessTokenResponse = await reqPromise(reqOptions);
    storeToken = accessTokenResponse.access_token;
    console.log('access token is : ' + storeToken);

    storeShopDetails(request, response);
    mongoClient.connect(
      serverUrl,
      { useNewUrlParser: true },
      (err: string, client: any) => {
        console.log('Connected successfully to server');
        const dbobj = client.db(badgeDB);
        // const dbobj = client.db.adminCommand({
        //   listDatabases: 1,
        //   filter: { name: storeName }
        // });
        // createWebhooks(request, response);
        console.log('storeName: ' + storeName);
        dbobj
          .listCollections({ name: storeName })
          .next((error: string, shopInfo: any) => {
            // console.log('shop info: ' + shopInfo);
            // storeMetaFields(request, response);
            if (!shopInfo) {
              console.log('go to store method');
              storeShopDetails(request, response);
              // createWebhooks(request, response);
              // getTheme(request, response);
              response.redirect('/static/welcome.html');
            } else {
              response.redirect('/static/welcome.html');
              // requestp.get('/static/welcome.html');
              console.log(
                forwardingAddress + '/static/welcome.html************'
              );

              // response.redirect(forwardingAddress + '/static/welcome.html');
            }
          });
        client.close();
      }
    );
  } catch (error) {
    console.log('Error in access token generation method : ' + error);
  }
}
export async function getMetaFields(id) {
  // return new Promise((resolve, reject) => {
  // console.log(id);
  const shopRequestUrl =
    'https://' + storeName + '/admin/products/' + id + '/metafields.json';
  const shopRequestHeaders = {
    'X-Shopify-Access-Token': storeToken
  };
  const shopReqOptions = {
    method: 'GET',
    uri: shopRequestUrl,
    headers: shopRequestHeaders,
    json: true
  };

  const shopResponseData = await reqPromise(shopReqOptions);
  const result = shopResponseData.metafields;

  return result;
}
export async function storeShopDetails(request: Request, response: Response) {
  console.log('inside store shop method');
  const shopRequestUrl = 'https://' + storeName + '/admin/shop.json';
  const shopRequestHeaders = {
    'X-Shopify-Access-Token': storeToken
  };

  const shopReqOptions = {
    method: 'GET',
    uri: shopRequestUrl,
    headers: shopRequestHeaders,
    json: true
  };

  let shopDetails: any;

  try {
    const shopResponseData = await reqPromise(shopReqOptions);
    console.log('shop response Data: ');
    console.log(shopResponseData);
    shopDetails = shopResponseData.shop; // JSON.parse(shopResponseData).shop;

    shopDetails = shopResponseData.shop; // JSON.parse(shopResponseData).shop;
    const data = JSON.stringify(shopDetails);
    const params = { Bucket: 'anumula', Key: 'shopdetails.json', Body: data };
    // pass your bucket name // file will be saved as testBucket/contacts.csv
    S3.upload(params, (s3Err, data1) => {
      if (s3Err) throw s3Err;
      console.log(`File uploaded successfully at ${data1.Location}`);
    });
    storeShopProductDetails(
      request,
      response,
      shopDetails.name,
      shopDetails.id
    );
  } catch (error) {
    console.log('Error in fetching store details from Shopify : ' + error);
  }
}

/* Store shop product's data into DB collection */
export async function storeShopProductDetails(
  request: Request,
  response: Response,
  shop,
  id
) {
  console.log('inside store shop products data');
  const shopProductsRequestUrl =
    'https://' + storeName + '/admin/products.json';
  const shopProductsRequestHeaders = { 'X-Shopify-Access-Token': storeToken };

  const shopProductsReqOptions = {
    method: 'GET',
    uri: shopProductsRequestUrl,
    headers: shopProductsRequestHeaders,
    json: true
  };

  const shopProductsResponseData = await reqPromise(shopProductsReqOptions);
  const prodlist = shopProductsResponseData.products;
  for (const product of prodlist) {
    const metafields = await getMetaFields(product.id);
    product.metafields = metafields;
    const toFloat = await convertToFloat(product);
  }
  const insert = await insertprod(prodlist);
}
export async function insertprod(product) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(product);
    const params = { Bucket: 'anumula', Key: 'products.json', Body: data };
    S3.upload(params, (s3Err, data1) => {
      if (s3Err) throw s3Err;
      console.log(`File uploaded successfully at ${data1.Location}`);
    });
    resolve('done');
  });
}
export async function convertToFloat(product) {
  return new Promise((resolve, reject) => {
    for (const variant of product.variants) {
      variant.price = parseFloat(variant.price);
      variant.compare_at_price = parseFloat(variant.compare_at_price);
    }
    resolve('done');
  });
}

export async function createWebhooks(request: Request, response: Response) {
  console.log('inside store webhooks');
  const shopRequestUrl = 'https://' + storeName + '/admin/webhooks.json';
  const shopRequestHeaders = {
    'X-Shopify-Access-Token': storeToken
  };

  createProductWebhooks(shopRequestUrl, shopRequestHeaders);
  updateProductWebhooks(shopRequestUrl, shopRequestHeaders);
  deleteProductWebhooks(shopRequestUrl, shopRequestHeaders);
}

export async function createProductWebhooks(
  shopRequestUrl,
  shopRequestHeaders
) {
  const webhooksOptions = {
    method: 'POST',
    uri: shopRequestUrl,
    body: {
      webhook: {
        topic: 'products/create',
        address: forwardingAddress + '/tricon/createProduct/' + storeName,
        metafield_namespaces: ['brand', 'type', 'type', 'game'],
        format: 'json'
      }
    },
    headers: shopRequestHeaders,
    json: true
  };
  const webhooksResponse = await reqPromise(webhooksOptions);
  console.log('createProduct webhooks response:', webhooksResponse);
}

export async function updateProductWebhooks(
  shopRequestUrl,
  shopRequestHeaders
) {
  const webhooksOptions = {
    method: 'POST',
    uri: shopRequestUrl,
    body: {
      webhook: {
        topic: 'products/update',
        address: forwardingAddress + '/tricon/updateProduct/' + storeName,
        metafield_namespaces: ['brand', 'type', 'type', 'game'],
        format: 'json'
      }
    },
    headers: shopRequestHeaders,
    json: true
  };
  const webhooksResponse = await reqPromise(webhooksOptions);
  console.log('updateProduct webhooks response:', webhooksResponse);
}

export async function deleteProductWebhooks(
  shopRequestUrl,
  shopRequestHeaders
) {
  const webhooksOptions = {
    method: 'POST',
    uri: shopRequestUrl,
    body: {
      webhook: {
        topic: 'products/delete',
        address: forwardingAddress + '/tricon/deleteProduct/' + storeName,
        metafield_namespaces: ['brand', 'type', 'type', 'game'],
        format: 'json'
      }
    },
    headers: shopRequestHeaders,
    json: true
  };
  const webhooksResponse = await reqPromise(webhooksOptions);
  console.log('deleteProduct webhooks response:', webhooksResponse);
}

// Delete product from our DB when triggered from webhook
export async function deleteProduct(req, res) {
  console.log('Entered deleteProduct');
  const shopname = req.params.shopname;
  let proddata;
  const params = { Bucket: 'anumula', Key: 'products.json' };

  s3.getObject(params, (err, data) => {
    if (err) console.error(err);
    const objectData = data.Body.toString('utf-8');
    proddata = JSON.parse(objectData);
    console.log(proddata[0]);
  });
  console.log(shopname);
  const prodId = parseInt(req.body.id);
  for (const prod of proddata) {
    if (prod.id === prodId) {
      proddata.delete(prod);
    }
  }
  const insert = await insertprod(proddata);
}

// Update product from our DB when triggered from webhook
export async function updateProduct(req, res) {
  const prodId = parseInt(req.body.id);
  const metafields = await getMetaFields(prodId);
  // console.log(metafields);
  mongoClient.connect(
    serverUrl,
    { useNewUrlParser: true },
    (err, db) => {
      if (err) throw err;

      console.log('inside updateProd');
      const shopname = req.params.shopname;
      const shop = shopname.split('.');
      const dbo = db.db(shop[0]);
      console.log('---SHOPNAME---');
      console.log(req.params.shopname);
      console.log('---PARAMS----');
      let flag = 0;

      const myquery = { id: prodId };
      console.log('id: ' + prodId);

      const newvalues = { $set: req.body };
      console.log('req.body:');
      console.log(req.body);

      dbo.collection(shopname).updateOne(myquery, newvalues, (error, obj) => {
        if (error) throw error;
        console.log('product updated:' + obj);
      });
      flag = 1;
      if (flag === 1) {
        const cursor = dbo
          .collection('Products')
          .find({ 'variants.0.price': { $exists: true, $type: 2 } });
        cursor.forEach(doc => {
          const newPrice = Number(
            doc.variants[0].price.replace(/[^0-9\.]+/g, '')
          );
          console.log('before: ' + doc.variants[0].price);
          console.log('after: ' + newPrice);
          // bulkUpdateOps.push(
          const q = { _id: doc._id };
          const n = { $set: { 'variants.0.price': newPrice } };
          dbo.collection(shop[0]).updateOne(q, n, (er, obj) => {
            if (er) throw er;
            console.log('set newPrice done : ' + obj);
          });
        });
      }
      res.send({ message: 'Product updated' });
      // db.close();
    }
  );
}

// Create product in our DB when triggered by webhook
export async function createProduct(req, res) {
  let proddata;
  console.log('afdza');
  const params = { Bucket: 'anumula', Key: 'products.json' };

  s3.getObject(params, (err, data) => {
    if (err) console.error(err);
    const objectData = data.Body.toString('utf-8');
    proddata = JSON.parse(objectData);
    console.log(proddata[0]);
  });
  const prod = req.body;
  const shopname = req.params.shopname;
  for (const variant of prod.variants) {
    variant.price = parseFloat(variant.price);
    variant.compare_at_price = parseFloat(variant.compare_at_price);
  }
  proddata.push(prod);
  const insert = await insertprod(proddata);
}

export async function getTheme(req, res) {
  const shopRequestUrl1 = 'https://' + storeName + '/admin/themes.json';
  const shopRequestHeaders = {
    'X-Shopify-Access-Token': storeToken
  };
  let themeid;
  requestp
    .get(shopRequestUrl1, { headers: shopRequestHeaders })
    .then(themeID => {
      JSON.parse(themeID).themes.map(themes => {
        if (themes.role === 'main') {
          themeid = themes.id;
          console.log('theme ID:', themeid);
        }
      });
      // themeid = JSON.parse(themeID).themes[2].id;
      // console.log("theme ID:", themeid);

      const shopRequestUrl =
        'https://' +
        storeName +
        '/admin/themes/' +
        themeid +
        '/assets.json?asset[key]=layout/theme.liquid&theme_id=' +
        themeid;
      let theme;

      requestp
        .get(shopRequestUrl, { headers: shopRequestHeaders })
        .then(shopResponse => {
          theme = JSON.parse(shopResponse).asset.value;
          console.log('theme details');
          console.log(shopResponse);
          console.log('theme:');
          console.log(theme);
          const split = theme.split('{{ content_for_header }}');
          theme =
            split[0] +
            "{{ content_for_header }} {% include 'tricon-badge' %}" +
            split[1];
          console.log(theme);
          const scriptjson = {
            asset: {
              key: 'layout/theme.liquid',
              value: theme
            }
          };

          const scriptheaders = {
            'X-Shopify-Access-Token': storeToken,
            // 'X-Shopify-Topic': "products/create",
            // 'X-Shopify-Shop-Domain': globalShop,
            'Content-Type': 'application/json'
          };

          const webhookUrl =
            'https://' +
            storeName +
            '/admin/themes/' +
            themeid +
            '/assets.json';

          requestp
            .put(webhookUrl, { headers: scriptheaders, json: scriptjson })
            .then(response => {
              console.log(response);
            })
            .catch(error => {
              if (error) throw error;
            });

          const srcvalue = '"{{ \'tricon-label.js\' | asset_url }}"';
          const scriptjson2 = {
            asset: {
              key: 'snippets/tricon-badge.liquid',
              value:
                "{% if template contains 'product' %} \n" +
                '<script> \n' +
                "var id ={{ product.id }} page = 'product' \n" +
                '</script> \n' +
                '{% endif %} \n' +
                "{% if template contains 'collection'" +
                "or template contains 'index' or template contains 'search' %} \n" +
                "<script> page = 'collection' </script> \n" +
                '{% endif %} \n' +
                '<script src="{{ \'tricon-label.js\' | asset_url }}" async></script> \n'
            }
          };

          requestp
            .put(webhookUrl, { headers: scriptheaders, json: scriptjson2 })
            .then(response => {
              console.log(response);
            })
            .catch(error => {
              if (error) throw error;
            });

          const script1json = {
            asset: {
              key: 'assets/tricon-label.js.liquid',
              src: forwardingAddress + '/static/script.js'
            }
          };

          requestp
            .put(webhookUrl, { headers: scriptheaders, json: script1json })
            .then(response => {
              console.log(response);
            })
            .catch(error => {
              if (error) throw error;
            });
        })
        .catch(err => {
          console.log(err);
          res.send(err);
        });
    })
    .catch(err => {
      console.log(err);
      res.send(err);
    });
}
