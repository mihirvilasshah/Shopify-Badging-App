const s3 = require('../db');

exports.tags = async (event) => {
    const tagsArray = await getTags();
    // console.log(tagsArray);
    return tagsArray;
}

function getTags() {
    return new Promise((resolve, reject) => {
        // let proddata;
        const params = {
            Bucket: 'shopifytricon-jewel-store',
            Key: 'products.json'
        };
        const tagsArray = [];
        s3.getObject(params, (err, data) => {
            if (err) console.error(err);
            const objectData = data.Body.toString('utf-8');
            const proddata = JSON.parse(objectData);
            for (const prod of proddata) {
                if(prod.tags){
                tagsArray.push(prod.tags);
                }
            }
            resolve(tagsArray);
        });
    });
}

exports.metaFields = async (event) => {
    const metafields = await getmetaFields();
    return metafields;

}

function getmetaFields() {
    return new Promise((resolve, reject) => {
        const metafields = [];
        const params = {
            Bucket: 'shopifytricon-jewel-store',
            Key: 'products.json'
        };

        s3.getObject(params, (err, data) => {
            if (err) console.error(err);
            const objectData = data.Body.toString('utf-8');
            const proddata = JSON.parse(objectData);
            for (const prod of proddata) {
                for (const e of prod.metafields) {
                    if (prod.metafields.length > 0) {
                        metafields.push({
                            namespace: e.namespace,
                            key: e.key,
                            value: e.value
                        });
                    }
                }
            }
            resolve(metafields);
        });
    });
}
// -----------------------------------------------------------------------------------------
exports.currency = async (event) => {
    const curr = await getCurrency();
    return curr;
}

function getCurrency() {
    return new Promise((resolve, reject) => {
        const params = {
            Bucket: 'shopifytricon-jewel-store',
            Key: 'shopdetails.json'
        };

        s3.getObject(params, (err, data) => {
            if (err) console.error(err);
            const objectData = data.Body.toString('utf-8');
            const jsonData = JSON.parse(objectData);
            const curr = jsonData.currency;

            console.log(curr);
            resolve(curr);
        });
    });
}
// ----------------------------------------------------------------------
exports.pricerange = async (event) => {
    const pricerange = await pRange();
    return pricerange;
}
 function pRange(){
      return new Promise((resolve, reject) => {
        let range = {};
        const params = {
            Bucket: 'shopifytricon-jewel-store',
            Key: 'products.json'
        };

        s3.getObject(params, (err, data) => {
            if (err) console.error(err);
            const objectData = data.Body.toString('utf-8');
            const proddata = JSON.parse(objectData);
          range.maxprice = proddata[proddata.length-2].maxprice;
          range.minprice = proddata[proddata.length-1].minprice;
          console.log(proddata);
            resolve(range);
        });
    });
 }