// Load the AWS SDK
const aws = require('aws-sdk');

// Construct the AWS S3 Object - 

const s3 = new aws.S3({
            apiVersion: '2006-03-01'
 });
 module.exports = s3;