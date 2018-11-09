const express = require('express');
const app = express();
var mongodb = require('mongodb');
var mongoClient = mongodb.MongoClient;
var fs = require('fs');

app.listen(3000, () => {
    console.log('App listening on port 3000!');
});

 
var url = 'mongodb://172.16.18.189:27017/technicalkeeda';
 
mongoClient.connect(url, function(err, db) {
    if (err) {
        console.log('Sorry unable to connect to MongoDB Error:', err);
    } else {
 
        var bucket = new mongodb.GridFSBucket(db, {
            chunkSizeBytes: 1024,
            bucketName: 'images'
        });
 
        fs.createReadStream('c:\\r.png').pipe(
            bucket.openUploadStream('r.jpg')).on('error', function(error) {
            console.log('Error:-', error);
        }).on('finish', function() {
            console.log('File Inserted!!');
            process.exit(0);
        });
    }
});

