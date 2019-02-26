const s3 = require('../db');
// const ObjectId = require('mongodb').ObjectId;
function getproducts() {
    return new Promise((resolve, reject) => {
        let proddata = [];
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

function getbadgeData() {
    return new Promise((resolve, reject) => {
        let badData = [];
        const params = {
            Bucket: 'shopifytricon-jewel-store',
            Key: 'badges.json'
        };

        s3.getObject(params, (err, data) => {
            if (err) console.error(err);
            const objectData = data.Body.toString('utf-8');
            badData = JSON.parse(objectData);
            resolve(badData);
        });
    });
}

exports.publishBadges = async (event) => {
    const badges = await getbadgeData();
    const products = await getproducts();
    console.log('body: ' + JSON.stringify(event.body));
    console.log(event.body.bid);
    let imgsrc;
    let thumbnailSrc;
    const newoid = Math.random() * Math.pow(10, 20);
    for (const b of badges) {
        if (b._id === event.body.bid) {
            imgsrc = b.imageSource;
            thumbnailSrc = b.thumbnailSource;

            break;
        }
    }
    const badgedata = {
        abid: newoid,
        Bid: event.body.bid,
        left: event.body.xvalue,
        top: event.body.yvalue,
        opvalue: event.body.opval,
        size: event.body.size,
        brightness: event.body.brightness,
        rotation: event.body.rotation,
        grayscale: event.body.grayscale,
        contrast: event.body.contrast,
        imageSource: event.body.thumbnailSource,
        thumbnailSource: event.body.thumbnailSource
    };
    console.log(badgedata);
    for (let i = 0; i < event.body.pid.length; i++) {
        const pushed = await pushBadge(products, event, i, badgedata);
        console.log(pushed);
        if (event.body.filter === 'Price') {
            const priceV = await pricevariants(products, event, i, newoid);
            console.log(priceV);
        } else {
            const other = await variantsOthrs(products, event, newoid);
            console.log('variant',other);
        }
    }
    const upload = await insertprod(products);
}
// ------------------------------------------------------------------------------------
function variantsOthrs(products, req, newoid) {
    return new Promise((resolve, reject) => {
        for (const pd of req.body.pid) {
            for (const p of products) {
                if (parseInt(p.id) === parseInt(pd)) {
                    for (const ob of p.variants) {
                        if (ob.badge) {
                            ob.badge.push({
                                abid: newoid,
                                thumbnailSource: req.body.thumbnailSource
                            });
                        } else {
                            const obj = [{
                                abid: newoid,
                                thumbnailSource: req.body.thumbnailSource
                            }];
                            ob.badge = obj;
                        }
                    }
                }
            }
        }
        resolve('done');
    });
}

function pricevariants(products, req, i, newoid) {
    return new Promise((resolve, reject) => {
        const v = parseFloat(req.body.vid[i]);
        const pr = parseFloat(req.body.pid[i]);
        const v1 = req.body.vid[i];
        for (const p of products) {
            if (parseInt(p.id) === parseInt(pr)) {
                for (const vari of p.variants) {
                    if (parseInt(vari.id) === parseInt(v)) {
                        if (vari.badge) {
                            vari.badge.push({
                                abid: newoid,
                                thumbnailSource: req.body.thumbnailSource
                            });
                        } else {
                            const obj = [{
                                abid: newoid,
                                thumbnailSource: req.body.thumbnailSource
                            }];
                            vari.badge = obj;
                        }
                    }
                }
            }
        }
        resolve('done');
    });
}

function pushBadge(products, req, i, badgedata) {
    return new Promise((resolve, reject) => {
        for (const p of products) {
            if (parseInt(p.id) === parseInt(req.body.pid[i])) {
                if (
                    i === 0 ||
                    req.body.pid[i] !== req.body.pid[i - 1] ||
                    req.body.filter !== 'Price'
                ) {
                    if (p.badge) {
                        p.badge.push(badgedata);
                    } else {
                        p.badge = [badgedata];
                    }
                }
            }
        }
        resolve('done');
    });
}

function insertprod(product) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(product);
        const params = {
            Bucket: 'shopifytricon-jewel-store',
            Key: 'products.json',
            Body: data
        };
        s3.upload(params, (s3Err, data1) => {
            if (s3Err) throw s3Err;
            console.log(`File uploaded successfully at ${data1.Location}`);
        });
        resolve('done');
    });
}
// ----------------------------------------------------------------------------------------

exports.unpublishBadges = async (event) => {
    console.log('response result');

    console.log(event.body.pid);

    getIds();

    async function getIds() {
        const products = await getproducts();
        for (let i = 0; i < event.body.pid.length; i++) {
            for (let j = 0; j < event.body.pid[i].bid.length; j++) {
               // console.log(event.body.pid[i].bid[j]);

                
                if (event.body.filter === 'Price') {
                    
                    const rem = await dbRemove(i, j, products);
                   // console.log('rem', rem);

                    let object;
                    object = await checkAllvariants(event.body.pid[i].prodid, products);
                    let deleteBadge;
                    for (let k = 0; k < object.length; k++) {
                        deleteBadge = await check(
                            object[k],
                            event.body.pid[i].prodid,
                            event.body.pid[i].bid[j],
                            k,
                            products
                        );
                        console.log('deleteBadge', deleteBadge);
                        if (deleteBadge === false) {
                            break;
                        }
                    }

                    console.log('deleteBadge', object);
                    const remP = await removeProdLevel(deleteBadge, i, j, products);
                    const upload = await insertprod(products);
                    console.log('remP', remP);
                } else {
                    const others = await other(i, j, products);
                    console.log('others', others);
                }
            }
        }
         const upload = await insertprod(products);
    }

    function other(i, j, products) {
        return new Promise((resolve, reject) => {
            for (const p of products) {
                if (p.variants) {
                if (p.id === parseFloat(event.body.pid[i].prodid) && p.badge) {
                    const index = p.badge.findIndex(
                        x => x.abid === parseFloat(event.body.pid[i].bid[j])
                    );
                    console.log(index);
                    p.badge.splice(index, 1);
                }
                for (const v of p.variants) {
                    if (v.badge) {
                        const index = v.badge.findIndex(
                            x => x.abid === parseFloat(event.body.pid[i].bid[j])
                        );
                        v.badge.splice(index, 1);
                    }
                }
            }
            }

            resolve('done others');
        });
    }

    function dbRemove(i, j, products) {
        return new Promise((resolve, reject) => {
            
            for (const p of products) {
                if (p.variants){
                for (const v of p.variants) {
                    if (v.id === parseFloat(event.body.pid[i].vid) && v.badge) {
                        console.log(v.badge);
                        const a = v.badge;
                        const index = a.findIndex(
                            x => x.abid === parseFloat(event.body.pid[i].bid[j])
                        );
                        console.log(a);
                        v.badge.splice(index, 1);
                        resolve('done removing from variant');
                    }
                }
            }
        }
        });
    }

    function checkAllvariants(pid, products) {
        return new Promise((resolve, reject) => {
            const vids = [];
            for (const p of products) {
                if(p.variants){
                if (p.id === parseFloat(pid)) {
                    for (const v of p.variants) {
                        vids.push(v.id);
                    }
                }
            }
            }
            resolve(vids);
        });
    }

    function check(object, pid, abid, k, products) {
        return new Promise((resolve, reject) => {
            let deleteBadge = true;
            for (const p of products) {
                if(p.variants){
                if (p.id === parseFloat(pid)) {
                    for (const v of p.variants) {
                        if (v.id === parseFloat(object) && v.badge) {
                            const a = v.badge;
                            for (const b of a) {
                                if (b.abid === parseFloat(abid)) {
                                    deleteBadge = false;
                                    break;
                                }
                            }
                        }
                    }
                }
            }
            }
            resolve(deleteBadge);
        });
    }

    function removeProdLevel(deleteBadges, i, j, products) {
        return new Promise((resolve, reject) => {
            if (deleteBadges) {
                for (const p of products) {
                    // find index
                    if (p.id === parseFloat(event.body.pid[i].prodid) && p.badge) {
                        const index = p.badge.findIndex(
                            x => x.abid === parseFloat(event.body.pid[i].bid[j])
                        );
                        p.badge.splice(index, 1);
                    }
                }
            }
            resolve('done');
        });
    }
}