"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// import * as express from 'express';
const express_1 = require("express");
const angularController = require("../controller/angular.controller");
// const log = require('../util/winston').getLogger(APP_CONFIG.LOG_ENABLE_CONSOLE_LOG).logs;
const router = express_1.Router();
const multer = require('multer');
// const upload = multer({ limits: { fileSize: 2000000 }, dest: '/uploads/' })
const storages = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(undefined, 'src/');
    },
    filename: (req, file, cb) => {
        cb(undefined, file.fieldname + '-' + Date.now());
    }
});
const upload = multer({ storage: storages });
// api to get the user uploaded badges
router.get('/getMyBadges/:shopname', (request, response) => {
    angularController.getMybadges(request, response);
});
router.get('/getMyLibrary/:shopname', (request, response) => {
    angularController.getMyLibrary(request, response);
});
// get the badge picture
router.get('/picture/:picture/:shopname', (request, response) => {
    angularController.getPicture(request, response);
});
router.get('/getProduct/:id', (request, response) => {
    angularController.getProduct(request, response);
});
router.get('/getIDS/:shopname', (request, response) => {
    angularController.getIDS(request, response);
});
router.get('/getUserIDS', (request, response) => {
    angularController.getUserIDS(request, response);
});
// router.get('/getSrc/:pid', (request: Request, response: Response) => {
//   angularController.getSrc(request, response);
// });
// router.post('/getbadges', (request: Request, response: Response) => {
//   angularController.getbadges(request, response);
// });
router.get('/getProductPriceRange/:shopname/:p1/:p2/:pr', (request, response) => {
    angularController.getProductPriceRange(request, response);
});
router.get('/getProductDiscountRange/:shopname/:d1/:pr', (request, response) => {
    angularController.getProductDiscountRange(request, response);
});
router.get('/getProductDateRange/:shopname/:d1/:d2/:dr', (request, response) => {
    angularController.getProductDateRange(request, response);
});
router.get('/getProductTitle/:shopname/:t1/:tr', (request, response) => {
    angularController.getProductTitle(request, response);
});
router.get('/getProductTag/:shopname/:tg1/:tr', (request, response) => {
    angularController.getProductTag(request, response);
});
router.post('/deleteUserBadge/:shopname', (request, response) => {
    angularController.deleteBadge(request, response);
});
router.post('/api/upload/:shopname', upload.single('photo'), (request, response) => {
    angularController.upload(request, response);
});
router.get('/tags/:shopname', (request, response) => {
    angularController.tags(request, response);
});
router.get('/currency/:shopname', (request, response) => {
    angularController.currency(request, response);
});
exports.default = router;
//# sourceMappingURL=../../src/dist/routes/angular.route.js.map