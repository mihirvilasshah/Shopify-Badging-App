import { Request, Response } from 'express';
import { Db, MongoClient } from 'mongodb';

const compressImages = require('compress-images');
const crypto = require('crypto');
const fse = require('fs-extra');
const http = require('http');
const ObjectId = require('mongodb').ObjectId;
const nonce = require('nonce')();
import path = require('path');
const querystring = require('querystring');
const reqPromise = require('request-promise');
const mongoDB = require('../DAO/mongo.connect');
const dbmethods = require('../DAO/services/dbMethods');

// const forwardingAddress = 'https://dc7a4f9d.ngrok.io';
const url = 'mongodb://localhost:27017/';
let badgeDB = 'tricon-jewel-store';
const shop = 'Products';
const shopName = 'tricon-jewel-store.myshopify.com';

const mongoClient = require('mongodb').MongoClient;

export function getMybadges(req: Request, res: Response): any {
  mongoDB.connectDB(async err => {
    if (err) throw err;
    const db = mongoDB.getDB();
    badgeDB = req.params.shopname;
    const dbo = db.db(badgeDB);
    const badges = dbo.collection('badges');
    const badgeresult = await dbmethods.getbadges(badges);
    console.log(badgeresult);
    res.send(badgeresult);
  });
}
export function getMyLibrary(req: Request, res: Response): any {
  mongoDB.connectDB(async err => {
    if (err) throw err;
    const db = mongoDB.getDB();
    const dbo = db.db('TriconBadgeApp');
    dbo
      .collection('BadgeLibrary')
      .find({}, { projection: { imageSource: 1, thumbnailSource: 1 } })
      .toArray((error, results) => {
        // res.setHeader('content-type', results.contentType);
        const obj = [];
        for (let i = 0; i < results.length; i++) {
          obj[i] = {
            _id: results[i]._id,
            imageSource: results[i].imageSource,
            thumbnailSource: results[i].thumbnailSource,
            default: true
          };
        }
        res.send(obj);
        console.log(obj);
      });
  });
}
export function getPicture(req: Request, res: Response): any {
  const filename = req.params.picture;
  mongoDB.connectDB(async err => {
    const db = mongoDB.getDB();
    if (err) throw err;
    const dbname = req.params.shopname;
    const dbo = db.db(dbname);
    dbo
      .collection('badges')
      // perform a mongodb search and return only one result.
      // convert the letiable called filename into a valid objectId.
      .findOne({ _id: ObjectId(filename) }, (error, results) => {
        if (error) throw error;
        // set the http response header so the browser knows this
        // is an 'image/jpeg' or 'image/png'
        res.setHeader('content-type', results.contentType);
        // send only the base64 string stored in the img object
        // buffer element
        res.send(results.imageSource);
      });
  });
}
export function getProduct(req: Request, res: Response): any {
  mongoDB.connectDB(async err => {
    const db = mongoDB.getDB();
    if (err) throw err;
    const dbo = db.db(badgeDB);

    console.log('inside getProd');
    // let myquery = { _id: ObjectId(req.params.id) };
    const myquery = { id: parseInt(req.params.id) };
    // let myquery = { id: 1466289291362 };
    console.log('id: ' + req.params.id);
    dbo.collection(shop).findOne(myquery, (error, obj) => {
      if (error) throw error;
      console.log('product found: ' + obj);
      res.send(obj);
    });
    // res.send({ message: 'Found product' });
    db.close();
  });
}

export function getIDS(req: Request, res: Response): any {
  console.log('inside get IDS');
  MongoClient.connect(
    url,
    { useNewUrlParser: true },
    (err, db) => {
      if (err) throw err;
      badgeDB = req.params.shopname;
      const dbo = db.db(badgeDB);
      dbo
        .collection('badges')
        .find({ default: true }, { projection: { _id: 1 } })
        .toArray((error, result) => {
          if (error) throw error;
          let images: any;

          images = result;
          //  let ids = result[0];
          const ids = [];
          for (let i = 0; i < images.length; i++) {
            ids[i] = images[i]._id;
          }

          //    console.log(images[0]._id);
          console.log(ids);
          res.send(ids);
          // return ids;
        });
    }
  );
}

export function getUserIDS(req: Request, res: Response): any {
  console.log('inside get User IDS');
  MongoClient.connect(
    url,
    { useNewUrlParser: true },
    (err, db) => {
      if (err) throw err;
      badgeDB = req.params.shopname;
      const dbo = db.db(badgeDB);
      dbo
        .collection('badges')
        .find({ default: false }, { projection: { _id: 1 } })
        .toArray((error, result) => {
          if (error) throw error;
          let images: any;
          images = result;
          //  let ids = result[0];
          const ids = [];
          for (let i = 0; i < images.length; i++) {
            ids[i] = images[i]._id;
          }

          //    console.log(images[0]._id);
          console.log(ids);
          res.send(ids);
          // return ids;
        });
    }
  );
}
export function getProductDiscountRange(req: Request, res: Response): any {
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
  const tags1 = [];
  const price = [];
  const createdat = [];
  const isApplied = [];
  console.log('Inside Discount');
  const d1 = req.params.d1;
  const d2 = req.params.d2;
  console.log('d1: ' + d1);
  const pr = req.params.pr;
  console.log('pr: ' + pr);

  // let myquery=req.params.query;
  if (pr === 'all') {
    myquery = { 'variants.discount': parseInt(d1) };
    // 'variants': { price: { '$gte': p1, '$lte': p2 } }
  } else if (pr === 'withBadges') {
    myquery = {
      'variants.discount': parseInt(d1),
      badge: { $exists: true, $ne: [] }
    };
  } else if (pr === 'withoutBadges') {
    myquery = { 'variants.discount': parseInt(d1), badge: { $size: 0 } };
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
          console.log(products);

          //  let ids = result[0];

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
            // console.log(products[i].variants.length);
            console.log(variants[i]);
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
                console.log('ab', ab[j]);
                console.log('src', src[j]);
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
              console.log('ab', ab[j]);
              j++;
              abids[i] = ab;
              srcs[i] = src;
            }

            console.log('abids', abids[i]);
            console.log('src', srcs[i]);
          }
          console.log('abids', abids);
          console.log('SRC--', srcs);

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

exports.getIDS = (req, res) => {
  console.log('inside get IDS');
  MongoClient.connect(
    url,
    { useNewUrlParser: true },
    (err, db) => {
      badgeDB = req.params.shopname;
      const dbo = db.db(badgeDB);
      dbo
        .collection('badges')
        .find({ default: true }, { projection: { _id: 1 } })
        .toArray((error, result) => {
          if (error) throw error;
          const images = result;
          // let ids = result[0];
          const ids = [];
          for (let i = 0; i < images.length; i++) {
            ids[i] = images[i]._id;
          }

          //    console.log(images[0]._id);
          console.log(ids);
          res.send(ids);
          // return ids;
        });
    }
  );
};

exports.getUserIDS = (req, res) => {
  console.log('inside get User IDS');
  MongoClient.connect(
    url,
    { useNewUrlParser: true },
    (err, db) => {
      badgeDB = req.params.shopname;
      const dbo = db.db(badgeDB);
      dbo
        .collection('badges')
        .find({ default: false }, { projection: { _id: 1 } })
        .toArray((error, result) => {
          if (error) throw error;

          const images = result;
          // let ids = result[0];
          const ids = [];
          for (let i = 0; i < images.length; i++) {
            ids[i] = images[i]._id;
          }

          //    console.log(images[0]._id);
          console.log(ids);
          res.send(ids);
          // return ids;
        });
    }
  );
};

export function upload(req: Request, res: Response): any {
  console.log('api/upload');
  if (!req.file) {
    alert('No file received');
    return res.redirect('http://localhost:4200/');
  } else {
    console.log('file received');
    console.log(req.file.originalname);
    MongoClient.connect(
      url,
      { useNewUrlParser: true },
      (err, db) => {
        if (err) throw err;
        console.log('upload Pic to mongo');
        const picname = req.file.originalname;
        console.log('pic file name=' + picname);
        // read the img file from tmp in-memory location
        const newImg = fse.readFileSync(req.file.path);
        const codedPicName = Math.random() * Math.pow(10, 20) + picname;
        fse.copySync(
          req.file.path,
          'Badges/' + shop + '/image/' + codedPicName
        );

        const inputPathToYourImages =
          'Badges/' + shop + '/image/*.{jpg,JPG,jpeg,JPEG,png,svg,gif}';
        const outputPath = 'Badges/' + shop + '/thumbnail/';

        compressImages(
          inputPathToYourImages,
          outputPath,
          {
            compress_force: false,
            statistic: true,
            autoupdate: true
          },
          false,
          { jpg: { engine: 'mozjpeg', command: ['-quality', '60'] } },
          { png: { engine: 'webp', command: ['-q', '60'] } }, // png -> webp
          { svg: { engine: 'svgo', command: '--multipass' } },
          {
            gif: {
              engine: 'gif2webp',
              command: ['-f', '80', '-mixed', '-q', '30', '-m', '2']
            }
          },
          () => {} // gif -> webp
        );
        // encode the file as a base64 string.
        const encImg = newImg.toString('base64');
        // define your new document
        let newpicname = codedPicName;
        if (
          req.file.mimetype === 'image/png' ||
          req.file.mimetype === 'image/gif'
        ) {
          const split = codedPicName.split('.');
          newpicname = split[0] + '.webp';
        }
        const newItem = {
          // size: req.file.size,
          // img: Buffer(encImg, 'base64'),
          imageName: codedPicName,
          imageSource:
            'http://localhost:4567/Badges/' + shop + '/image/' + codedPicName,
          thumbnailSource:
            'http://localhost:4567/Badges/' + shop + '/thumbnail/' + newpicname,
          contentType: req.file.mimetype
        };
        badgeDB = req.params.shopname;
        const dbo = db.db(badgeDB);
        dbo.collection('badges').insert(newItem, (error, result) => {
          if (error) {
            console.log(error);
          }
          const newoid = new ObjectId(result.ops[0]._id);
          fse.remove(req.file.path, fileError => {
            if (fileError) {
              console.log(fileError);
            }
            console.log('uploaded: ' + newoid);
          });
          res.send(newoid);
        });
        console.log('upload done');

        // return res.redirect('http://localhost:4200/');
      }
    );
  }
}
export function deleteBadge(req: Request, res: Response): any {
  console.log('Entered delete badge');
  MongoClient.connect(
    url,
    { useNewUrlParser: true },
    (err, db) => {
      if (err) throw err;
      badgeDB = req.params.shopname;
      const dbo = db.db(badgeDB);
      const myquery = { imageName: req.body.name };
      console.log(myquery);
      fse.removeSync('Badges/' + shop + '/image/' + req.body.name);
      let newpicname = req.body.name;
      const split = req.body.name.split('.');
      if (split[1] === 'gif' || split[1] === 'png') {
        newpicname = split[0] + '.webp';
      }
      fse.removeSync('Badges/' + shop + '/thumbnail/' + newpicname);
      dbo.collection('badges').deleteOne(myquery, (error, obj) => {
        if (error) throw error;
        if (obj.deletedCount) {
          // console.log(obj);
          res.send(true);
        } else {
          res.send(false);
        }
      });
    }
  );
}

export function tags(req: Request, res: Response): any {
  console.log('asf');
  MongoClient.connect(
    url,
    { useNewUrlParser: true },
    (err, db) => {
      if (err) throw err;
      badgeDB = req.params.shopname;
      const dbo = db.db(badgeDB);

      dbo
        .collection(shop)
        .find({}, { projection: { tags: 1 } })
        .toArray((error, obj) => {
          if (error) throw error;
          const products = obj;
          console.log(obj);
          // let ids = result[0];

          const tagsArray = [];
          for (const product of products) {
            tagsArray.push(product.tags);
          }
          console.log('tags: ' + tagsArray);
          // console.log('product found: ' + );
          // res.send(obj);
          // res.render('selectproducts', { items: titles, pids: pids });
          res.send(tagsArray);
        });
    }
  );
}

export function currency(req: Request, res: Response): any {
  MongoClient.connect(
    url,
    { useNewUrlParser: true },
    (err, db) => {
      if (err) throw err;
      const dbo = db.db('TriconBadgeApp');
      const dbshop = shopName.split('.');
      console.log(dbshop[0]);

      dbo
        .collection(shopName)
        .find({ shopname: dbshop[0] }, { projection: { currency: 1 } })
        .toArray((error, obj) => {
          if (error) throw error;
          console.log('obj');
          console.log(obj);
          const cur = obj[0].currency;
          console.log('cur' + cur);
          // let ids = result[0];
          res.send(obj);
        });
    }
  );
}
