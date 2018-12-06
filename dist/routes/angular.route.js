"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// import * as express from 'express';
const express_1 = require("express");
const angularController = require("../controller/angular.controller");
// const log = require('../util/winston').getLogger(APP_CONFIG.LOG_ENABLE_CONSOLE_LOG).logs;
const router = express_1.Router();
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });
// const storages = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(undefined, 'src/');
//   },
//   filename: (req, file, cb) => {
//     cb(undefined, file.fieldname + '-' + Date.now());
//   }
// });
// const upload = multer({ limits: { fileSize: 2000000 }, dest: '/uploads/' });
// const upload = multer({
//   storage: multerS3({
//     s3: S3,
//     bucket: 'anumula',
//     acl: 'public-read',
//     metadata(req, file, cb) {
//       cb(undefined, { fieldName: file.fieldname });
//     },
//     key(req, file, cb) {
//       cb(undefined, Date.now().toString());
//     }
//   })
// }).single('photo');
// const singleUpload = upload;
// const upload = multer({ storage: storages });
// api to get the user uploaded badges
router.get('/getMyBadges/:shopname', (request, response) => {
    angularController.getMybadges(request, response);
});
router.get('/getMyLibrary/:shopname', (request, response) => {
    angularController.getMyLibrary(request, response);
});
// get the badge picture
router.get('/getProduct/:id', (request, response) => {
    angularController.getProduct(request, response);
});
// router.get('/getSrc/:pid', (request: Request, response: Response) => {
//   angularController.getSrc(request, response);
// });
// router.post('/getbadges', (request: Request, response: Response) => {
//   angularController.getbadges(request, response);
// });
router.post('/deleteUserBadge/:shopname', (request, response) => {
    angularController.deleteBadge(request, response);
});
router.post('/api/upload/:shopname', upload.single('photo'), (request, response) => {
    // upload(request, response, (err, some) => {
    //   if (err) {
    //     return response.status(422).send({
    //       errors: [{ title: 'Image Upload Error', detail: err.message }]
    //     });
    //   }
    //   return response.json({ imageUrl: request.file.location });
    // });
    angularController.upload(request, response);
});
// ----------------------------------------------------------------------------
router.get('/tags/:shopname', (request, response) => {
    angularController.tags(request, response);
});
router.get('/currency/:shopname', (request, response) => {
    angularController.currency(request, response);
});
router.get('/metafields/:shopname', (request, response) => {
    angularController.metaFields(request, response);
});
exports.default = router;
//# sourceMappingURL=../../src/dist/routes/angular.route.js.map