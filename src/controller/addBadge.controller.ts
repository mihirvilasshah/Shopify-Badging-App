import { Request, Response } from 'express';
import { Db, MongoClient } from 'mongodb';
// const forwardingAddress = 'https://dc7a4f9d.ngrok.io';
const url = 'mongodb://localhost:27017/';
const badgeDB = 'tricon-jewel-store';
const shop = 'tricon-jewel-store.myshopify.com';
const shopName = 'tricon-jewel-store.myshopify.com';

export function getSrc(req: Request, res: Response): any {
  MongoClient.connect(
    url,
    { useNewUrlParser: true },
    (err, db) => {
      if (err) throw err;
      console.log('check', db);
      const dbo = db.db(badgeDB);
      const myquery = { id: parseInt(req.params.pid) };
      console.log('id: ' + req.params.pid);
      dbo.collection(shop).findOne(myquery, (error, obj) => {
        if (error) throw error;
        let aid;
        aid = obj;
        //  res.send(obj.ABid);
        //  console.log('product found: ' + Aid);
        if (aid) {
          res.send(aid);
        }
      });
    }
  );
}
export function getbadges(req: Request, res: Response): any {
  console.log('body: ', req.body.src);
  const pagesrc = req.body.src;

  let flag;

  async function srcs(pagesrcs) {
    const prod = [];

    for (let i = 0; i < pagesrcs.length; i++) {
      const s = pagesrcs[i].split('=');
      const src = 'https:' + s[0] + s[1];

      // console.log(src);
      const myquery = {
        'image.src': new RegExp(s[1], 'i')
      };

      prod[i] = await findProd(myquery);
      console.log('1st');
      console.log(prod);
    }
    flag = await loopdone();
    res.send(prod);
  }

  function loopdone() {
    return new Promise((resolve, reject) => {
      resolve('done');
    });
  }
  function findProd(myquery) {
    return new Promise((resolve, reject) => {
      MongoClient.connect(
        url,
        { useNewUrlParser: true },
        (err, db) => {
          if (err) throw err;
          const dbo = db.db(badgeDB);
          dbo.collection(shop).findOne(myquery, (error, obj) => {
            if (error) throw error;
            resolve(obj);
          });
        }
      );
    });
  }
  srcs(pagesrc);
}
