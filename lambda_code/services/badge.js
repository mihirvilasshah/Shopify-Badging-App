// const s3 = require('../db');
// const fileType = require("fileType");
const AWS = require('aws-sdk');
//*/ get reference to S3 client 
var s3 = new AWS.S3();
exports.upload = async (event) => {
    let encodedImage = (event.body).image.value.split('base64,')[1];
    let decodedImage = Buffer.from(encodedImage, 'base64');
    const name = event.body.image.filename;
    const type = event.body.image.filetype;
    console.log(name);
    //  var filePath = "avatars/" + event.queryStringParameters.username + ".png"
    console.log('api/upload');
    // let fileMime = fileType(buffer)

    // if (fileMime === null) {
    //   console.log('file not received');
    // } else {
    console.log('file received');
    const uploaded = await uploadImage(event, decodedImage, name,type);
    console.log(uploaded);
    const badgeData = await getbadgedata();
    console.log(badgeData);
    const badgeinfo = await badgeDat(badgeData, name,type);
    //   }
}
// ---------------------------------------------------------------------------------------------

exports.getMybadges = async (event) => {
    const badgeData = await getbadgedata();

    // console.log(badgeData);
    // badges.push(badgeData);
    const badgeresult = await bresult(badgeData);
    console.log('adf');
    // console.log(badgeresult);

    return badgeresult;
}
// ----------------------------------------------------------------------------------------------


exports.getLibbadges = async (event) => {
    const badgeData = await getLibbadgedata();
    // console.log(badgeData);
    // badges.push(badgeData);
    // const badgeresult = await bresult(badgeData);
    console.log('adf');
    // console.log(badgeresult);

    return badgeData;
}
// ----------------------------------------------------------------------------------------------
exports.deleteBadge = async (event) => {
    console.log('Entered delete badge');

    const imagename = event.query.name;
    const params = {
        Bucket: 'shopifytricon-jewel-store',
        Key: 'BadgePictures/' + imagename
    };
    s3.deleteObject(params, (err, data1) => {
        if (data1) {
            console.log('File deleted successfully');
        } else {
            console.log('Check if you have sufficient permissions : ' + err);
        }
    });
    const badgeData = await getbadgedata();
    const deleted = await deleteinfo(badgeData, imagename);
    console.log(deleted);
    const data = JSON.stringify(deleted);
    const params1 = {
        Bucket: 'shopifytricon-jewel-store',
        Key: 'badges.json',
        Body: data
    };
    s3.upload(params1, (s3Err, dat) => {
        if (s3Err) throw s3Err;
        console.log(`File uploaded successfully at ${dat.Location}`);
    });

}
// -----------------------------------------------------------------------------------------------
function getbadgedata() {
    return new Promise((resolve, reject) => {
        const params = {
            Bucket: 'shopifytricon-jewel-store',
            Key: 'badges.json'
        };
        s3.getObject(params, (err, data) => {
            let badgedata = [];
            if (err) {
                console.error(err);
            } else {
                const objectData = data.Body.toString('utf-8');
                badgedata = JSON.parse(objectData);
                // console.log('asf' + objectData);
            }
            resolve(badgedata);
        });
    });
}

function getLibbadgedata() {
    return new Promise((resolve, reject) => {
        const params = {
            Bucket: 'shopifylibrary',
            Key: 'badges.json'
        };
        s3.getObject(params, (err, data) => {
            let badgedata = [];
            if (err) {
                console.error(err);
            } else {
                const objectData = data.Body.toString('utf-8');
                badgedata = JSON.parse(objectData);
                // console.log('asf' + objectData);
            }
            resolve(badgedata);
        });
    });
}

function uploadImage(event, decodedImage, name,type) {
    return new Promise((resolve, reject) => {
        var params = {
            "Body": decodedImage,
            "Bucket": "shopifytricon-jewel-store",
            "Key": "BadgePictures/"+name,
             ContentEncoding: 'base64',
             ContentType: type
             
        };
        s3.upload(params, (err, data) => {
            if (err) {
                throw err;
            }
            console.log(`File uploaded successfully at ${data.Location}`);
            resolve('done');
        });

    });
}

function badgeDat(oData, name,type) {
    return new Promise((resolve, reject) => {
        const badgeid = Math.random() * Math.pow(10, 20);
        const imagesrc =
            'https://s3.amazonaws.com/shopifytricon-jewel-store/BadgePictures/' + name;
        
        const badgeData = {
            _id: badgeid,
            imagename: name,
            imageSource: imagesrc,
            thumbnailSource: imagesrc,
            contentType: type,
            badgetype: "User"
        };
        oData.push(badgeData);
        // console.log(oData);

        const data = JSON.stringify(oData);
        const params1 = {
            Bucket: 'shopifytricon-jewel-store',
            Key: 'badges.json',
            Body: data,
        };
        s3.upload(params1, (s3Err, dat) => {
            if (s3Err) throw s3Err;
            console.log(`File uploaded successfully at ${dat.Location}`);
        });
        resolve('done');
    });
}

function bresult(badgeData) {
    return new Promise((resolve, reject) => {
        const badgeresults = [];
        let badges = [];
        for (const badge of badgeData) {
          
            badges.push({
                _id: badge._id,
                imageSource: badge.imageSource,
                thumbnailSource: badge.thumbnailSource,
                category: badge.category
            });
        }
        badgeresults.push({
          "category":"NA",
          "badges":badges
        })
        resolve(badgeresults);
    });
}


function deleteinfo(badgeData, imagename) {
    return new Promise((resolve, reject) => {
        for (const badge of badgeData) {
            if (badge.imagename === imagename) {
                const index = badgeData.indexOf(badge);
                if (index > -1) {
                    badgeData.splice(index, 1);
                }
            }
        }
        resolve(badgeData);
    });
}