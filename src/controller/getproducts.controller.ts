import { Request, Response } from 'express';
import { Db, MongoClient } from 'mongodb';
let badgeDB = 'tricon-jewel-store_';
const url = 'mongodb://localhost:27017/';
const shop = 'Products';
const shopName = 'tricon-jewel-store.myshopify.com';
let myquery: any;
const titles = [];
const variants = [];
const variants1 = [];
const variants2 = [];
const variants3 = [];
const variantsId = [];
const abids = [];
const srcs = [];
const pids = [];
const bids = [];
const tags1 = [];
const price = [];
const createdat = [];
const isApplied = [];
const fs = require('fs');
const AWS = require('aws-sdk');
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.S3_REGION
});

export function getProductPriceRange(req: Request, res: Response): any {
  const p1 = req.params.p1;
  const p2 = req.params.p2;
  const pr = req.params.pr;
  const params = { Bucket: 'anumula', Key: 'products.json' };
  let product = [];
  s3.getObject(params, (err, data) => {
    if (err) console.error(err);
    const objectData = data.Body.toString('utf-8');
    product = JSON.parse(objectData);
    console.log(product[0]);
  });
  for (let i = 0; i < product.length; i++) {
    for (let j = 0; i < product[i].variants.length; j++) {
      if (
        product[i].variants[j].price < p1 &&
        product[i].variants[j].price > p2
      ) {
        // items: titles,
        //   pids,
        //   badge: abids,
        //     tags: tags1,
        //       created_at: createdat,
        //         isApplied,
        //         src: srcs,
        //           variants,
        //           variantsId
        titles.push(product[i].title);
        pids.push(product[i].id);
        tags1.push(product[i].tags);
        createdat.push(product[i].created_at);
        isApplied.push(product[i].tags);
        srcs.push(product[i].tags);
        variants.push(product[i].tags);
        variantsId.push(product[i].tags);
      }
    }
  }

  if (pr === 'all') {
    myquery = {
      'variants.price': { $gte: parseInt(p1), $lte: parseInt(p2) }
      // 'variants': { price: { '$gte': p1, '$lte': p2 } }
    };
  } else if (pr === 'withBadges') {
    myquery = {
      'variants.price': { $gte: parseInt(p1), $lte: parseInt(p2) },
      badge: { $exists: true, $ne: [] }
    };
  } else if (pr === 'withoutBadges') {
    myquery = {
      'variants.price': { $gte: parseInt(p1), $lte: parseInt(p2) },
      badge: { $size: 0 }
    };
  }
  // console.log(myquery);

  MongoClient.connect(
    url,
    { useNewUrlParser: true },
    (err, db) => {
      if (err) throw err;
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
          if (error) throw error;
          const products = obj;
          // console.log(products);
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
            // console.log(variants[i]);
            pids[i] = products[i]._id;
            const x = products[i].created_at.split('T');
            createdat[i] = x[0];
            tags1[i] = products[i].tags;
            if (
              products[i].variants.badge &&
              products[i].variants.badge.length > 0
            ) {
              let j = 0;

              while (products[i].variants.badge[j]) {
                ab[j] = products[i].variants.badge[j].abid;
                src[j] = products[i].variants.badge[j].thumbnailSource;

                j++;
              }
              abids[i] = ab;
              srcs[i] = src;

              console.log('abids', abids[i]);
              isApplied[i] = 'yes';
            } else {
              isApplied[i] = 'no';
              let j = 0;

              ab[j] = '-';
              src[j] = '-';
              // console.log('ab', ab[j]);
              j++;
              abids[i] = ab;
              srcs[i] = src;
            }
          }

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
    }
  );
}
export function getProductDateRange(req: Request, res: Response): any {
  console.log('inside getProdPrice');
  const d1 = req.params.d1;
  console.log('d1: ' + d1);
  const d2 = req.params.d2;
  console.log('d2: ' + d2);
  const dr = req.params.dr;
  console.log('dr: ' + dr);
  // let myquery=req.params.query;

  if (dr === 'all') {
    myquery = {
      created_at: { $gte: d1, $lte: d2 }
    };
  } else if (dr === 'withBadges') {
    myquery = {
      created_at: { $gte: d1, $lte: d2 },
      badge: { $exists: true, $ne: [] }
    };
  } else if (dr === 'withoutBadges') {
    myquery = {
      created_at: { $gte: d1, $lte: d2 },
      badge: { $not: { $size: 0 } }
    };
  }
  console.log(myquery);
  MongoClient.connect(
    url,
    { useNewUrlParser: true },
    (err, db) => {
      if (err) throw err;
      badgeDB = req.params.shopname;
      const dbo = db.db(badgeDB);
      dbo
        .collection(shop)
        .find(myquery, {
          projection: { _id: 1, title: 1, created_at: 1, tags: 1, badge: 1 }
        })
        .toArray((error, obj) => {
          if (error) throw error;
          const products = obj;
          console.log(obj);
          // let ids = result[0];
          for (let i = 0; i < products.length; i++) {
            const b = [];
            const ab = [];
            const src = [];
            titles[i] = products[i].title;
            pids[i] = products[i]._id;
            const x = products[i].created_at.split('T');
            createdat[i] = x[0];
            tags1[i] = products[i].tags;
            if (products[i].badge && products[i].badge.length > 0) {
              let j = 0;
              while (products[i].badge[j]) {
                b[j] = products[i].badge[j].Bid;
                ab[j] = products[i].badge[j].abid;
                src[j] = products[i].badge[j].thumbnailSource;
                console.log('b', b[j]);
                console.log('src', src[j]);
                j++;
              }
              bids[i] = b;
              abids[i] = ab;
              srcs[i] = src;
              console.log('bids', bids[i]);
              isApplied[i] = 'yes';
            } else {
              isApplied[i] = 'no';
              let j = 0;
              b[j] = '-';
              ab[j] = '-';
              src[j] = '-';
              console.log('b', b[j]);
              j++;
              bids[i] = b;
              abids[i] = ab;
              srcs[i] = src;
            }
            console.log('bids', bids[i]);
          }
          res.send({
            items: titles,
            pids,
            badge: abids,
            tags: tags1,
            created_at: createdat,
            isApplied,
            src: srcs
          });
        });
    }
  );
}
export async function getproducts() {
  return new Promise((resolve, reject) => {
    const metafields = [];
    const params = { Bucket: 'anumula', Key: 'products.json' };

    s3.getObject(params, (err, data) => {
      if (err) console.error(err);
      const objectData = data.Body.toString('utf-8');
      const proddata = JSON.parse(objectData);
      resolve(proddata);
    });
  });
}

export async function getProductTitle(req: Request, res: Response) {
  console.log('inside getProdTitle');
  const prodData = await getproducts();
  const t1 = req.params.t1;
  const tr = req.params.tr;
  const thumbnail = [];
  for (let i = 0; i < prodData.length; i++) {
    tittles[i] = prodData[i].;
  }

  console.log('t1: ' + t1);
  console.log('tr: ' + tr);

  //    let t = '/'+t1+'/i';
  if (tr === 'all') {
    myquery = {
      title: new RegExp(t1, 'i')
    };
  } else if (tr === 'withBadges') {
    myquery = {
      title: new RegExp(t1, 'i'),
      badge: { $exists: true, $ne: [] }
    };
  } else if (tr === 'withoutBadges') {
    myquery = {
      title: new RegExp(t1, 'i'),
      badge: { $exists: false }
    };
  }
  MongoClient.connect(
    url,
    { useNewUrlParser: true },
    (err, db) => {
      if (err) throw err;
      badgeDB = req.params.shopname;

      const dbo = db.db(badgeDB);
      dbo
        .collection(shop)
        .find(myquery, {
          projection: {
            _id: 1,
            title: 1,
            created_at: 1,
            tags: 1,
            badge: 1
          }
        })
        .toArray((error, obj) => {
          if (error) throw error;
          const products = obj;
          for (let i = 0; i < products.length; i++) {
            const b = [];
            const ab = [];
            const src = [];
            titles[i] = products[i].title;
            pids[i] = products[i]._id;
            const x = products[i].created_at.split('T');
            createdat[i] = x[0];
            tags1[i] = products[i].tags;
            if (products[i].badge && products[i].badge.length > 0) {
              let j = 0;

              while (products[i].badge[j]) {
                b[j] = products[i].badge[j].Bid;
                ab[j] = products[i].badge[j].abid;
                src[j] = products[i].badge[j].thumbnailSource;
                console.log('b', b[j]);
                j++;
              }
              bids[i] = b;
              abids[i] = ab;
              srcs[i] = src;
              console.log('bids', bids[i]);
              isApplied[i] = 'yes';
            } else {
              isApplied[i] = 'no';
              let j = 0;

              b[j] = '-';
              ab[j] = '-';
              console.log('b', b[j]);
              j++;
              bids[i] = b;
              abids[i] = ab;
              srcs[i] = src;
            }
            console.log('bids', bids[i]);
          }
          res.send({
            items: titles,
            pids,
            badge: abids,
            tags: tags1,
            created_at: createdat,
            isApplied,
            src: srcs,
            abids
          });
        });
    }
  );
}

export function getProductTag(req: Request, res: Response): any {
  // let myquery;
  const t1 = req.params.t1;
  const tr = req.params.tr;
  console.log('inside getProdTag');
  const tg1 = req.params.tg1;
  console.log('tg1: ' + tg1);
  console.log('tr: ' + tr);
  //    let t = '/'+t1+'/i';
  if (tr === 'all') {
    myquery = {
      tags: new RegExp(tg1, 'i')
    };
  } else if (tr === 'withBadges') {
    myquery = {
      tags: new RegExp(tg1, 'i'),
      badge: { $exists: true, $ne: [] }
    };
  } else if (tr === 'withoutBadges') {
    myquery = {
      tags: new RegExp(tg1, 'i'),
      badge: { $exists: false }
    };
  }

  MongoClient.connect(
    url,
    { useNewUrlParser: true },
    (err, db) => {
      if (err) throw err;
      badgeDB = req.params.shopname;
      const dbo = db.db(badgeDB);
      dbo
        .collection(shop)
        .find(myquery, {
          projection: { _id: 1, title: 1, created_at: 1, tags: 1, badge: 1 }
        })
        .toArray((error, obj) => {
          if (error) throw error;
          const products = obj;
          for (let i = 0; i < products.length; i++) {
            const b = [];
            const ab = [];
            const src = [];
            titles[i] = products[i].title;
            pids[i] = products[i]._id;
            const x = products[i].created_at.split('T');
            createdat[i] = x[0];
            tags1[i] = products[i].tags;
            if (products[i].badge && products[i].badge.length > 0) {
              let j = 0;
              while (products[i].badge[j]) {
                b[j] = products[i].badge[j].Bid;
                ab[j] = products[i].badge[j].abid;
                src[j] = products[i].badge[j].thumbnailSource;
                console.log('b', b[j]);
                j++;
              }
              bids[i] = b;
              abids[i] = ab;
              srcs[i] = src;
              console.log('bids', bids[i]);
              isApplied[i] = 'yes';
            } else {
              isApplied[i] = 'no';
              let j = 0;

              b[j] = '-';
              ab[j] = '-';
              console.log('b', b[j]);
              j++;
              bids[i] = b;
              abids[i] = ab;
              srcs[i] = src;
            }
            console.log('bids', bids[i]);
          }
          res.send({
            items: titles,
            pids,
            badge: abids,
            tags: tags1,
            created_at: createdat,
            isApplied,
            src: srcs
          });
        });
    }
  );
}
