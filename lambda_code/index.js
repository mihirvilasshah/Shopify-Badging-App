const getP = require('./services/getproducts');
const badge = require('./services/badge');
const Pbadge = require('./services/publish');
const Pdata = require('./services/getdata');
const s3 = require('./db');
const expressJwt = require('express-jwt');
let jwt = require('jsonwebtoken');
let shop;
// Main function

// -------------------------------------------------------------------------------------------

exports.handler = async (event, context, callback) => {

    if (event.path === '/shopify/app') {
        let shop = event.body;
        console.log(event);
        console.log(shop);
        //     let acctoken = event.header.shop;
        let token = jwt.sign({
                shop: shop
            },
            'secretekey', {
                expiresIn: '24h' // expires in 24 hours
            }
        );
        console.log(token);
        const res = {
            statusCode: 200,
            body: token
        };
        callback(undefined, res);
    }
    //---------------------------------------------------------------------------------------------------------------------------------    
    if (event.path === '/login') {
        console.log(event.body);
        let shop = event.body;
        let token = jwt.sign({shop:shop}, 'secret-key', {
          
          expiresIn: 120
      });   

        const res = {
            statusCode: 200,
            body: JSON.stringify({token:token,expiresIn:120}),
            headers: {
                    "content-type": "text/plain"
                },
        };
        callback(undefined, res);
    }
    //----------------------------------------------------------------------------------------------------
    if (event.path === '/products') {
         //  const a = await checkToken(event)
        //  console.log(a);
        //   if(a){

        const products = await getprod();
        // returns the products from s3
    //    console.log(products);

        // if (event.query.p1) {
        //     const price = await getP.getPriceproducts(products, event);
        //     console.log(event.query.p2);
        //     const res = {
        //         statusCode: 200,
        //         headers: {
        //             "Set-Cookie": shop
        //         },
        //         body: price
        //     };
        //     callback(undefined, res);
        //     // filters the products and returns only products based on queries
        // }
        // if((event.query.p1)&&(event.query.d1)){
           const Mprod = await getP.getMultiproducts(products, event);
            console.log(event.query.p2);
            const res = {
                statusCode: 200,
                body: Mprod
            };
            callback(undefined, Mprod);
        // }
        // if (event.query.d1) {
        //     const date = await getP.getDateproducts(products, event);
        //     const res = {
        //         statusCode: 200,
        //         headers: {
        //             "Set-Cookie": shop
        //         },
        //         body: date
        //     };
        //     callback(undefined, res);
        // }
        // if (event.query.t1) {
        //     const title = await getP.getTitleproducts(products, event);
        //     callback(undefined, title);
        // }
        // if (event.query.tg1) {
        //     const tag = await getP.gettagproducts(products, event);
        //     callback(undefined, tag);
        // }
//}
//
    }
    //------------------------------------------------------------------------------------------------------------------
    if (event.path === '/badge') {
        //   const a = await checkToken(event)
        //   console.log(a);
        //   if(a){
        if (event.method === 'POST') {
            badge.upload(event);
            callback(undefined, "done");
        }
        if (event.method === 'GET') {
            if (event.query.type === 'user') {
                const badgeData = await badge.getMybadges(event);
                callback(undefined, badgeData);
            }
            if (event.query.type === 'default') {
                const badgeData = await badge.getLibbadges(event);
                callback(undefined, badgeData);
            }
        }
        if (event.method === 'DELETE') {
            badge.deleteBadge(event);
            const res = {statusCode: 200,
                body: 'done'}
            callback(undefined,res);
        }

  //  }
    //
    }
    
    //--------------------------------------------------------------------------------------------------------------------------------
    if (event.path === '/publish') {
         //  const a = await checkToken(event)
        //  console.log(a);
        //   if(a){
        const p = await Pbadge.publishBadges(event);
    //}
//
    }
    //---------------------------------------------------------------------------------------------------------------------------------
    if (event.path === '/unpublish') {
         //  const a = await checkToken(event)
        //  console.log(a);
        //   if(a){
        const unp = await Pbadge.unpublishBadges(event);
        //}
        //
    }
        //---------------------------------------------------------------------------------------------------------------------------------
    if (event.path === '/getdata') {
         //  const a = await checkToken(event)
        //  console.log(a);
        //   if(a){
        if (event.query.type === 'currency') {
            const currency = await Pdata.currency(event);
            callback(undefined, currency);
        }
        if (event.query.type === 'metafields') {
            const metaFields = await Pdata.metaFields(event);
            callback(undefined, metaFields);
        }
        if (event.query.type === 'pricerange') {
            const pricerange = await Pdata.pricerange(event);
            callback(undefined, pricerange);
        }
        if (event.query.type === 'tags') {
            const tags = await Pdata.tags(event);
            callback(undefined, tags);
        }
        //}
        //
    }
      //---------------------------------------------------------------------------------------------------------------------------------  

}


function getprod() {
    return new Promise((resolve, reject) => {
        let proddata;
        const params = {
            Bucket: 'shopifytricon-jewel-store',
            Key: 'products.json'
        };

        s3.getObject(params, (err, data) => {
            if (err) console.error(err);
            const objectData = data.Body.toString('utf-8');
            proddata = JSON.parse(objectData);
            resolve(proddata);
        });
    });
}
 function checkToken(event) {
     return new Promise((resolve, reject) => {
  let token = event.headers['Authorization'];
  console.log(token);
  // Express headers are auto converted to lowercase
  if (token.startsWith('Bearer ')) {
    // Remove Bearer from string
    token = token.slice(7, token.length);
  }

  if (token) {
    jwt.verify(token, 'secret-key', (err, decoded) => {
      if (err) {
        resolve(false);
      } else {
        console.log('true');
          resolve(true);;
      }
    });
  } else {
      resolve(false);;
  }
     });
};