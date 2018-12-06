"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// import * as express from 'express';
const express_1 = require("express");
const shopController = require("../controller/shop.controller");
// const log = require('../util/winston').getLogger(APP_CONFIG.LOG_ENABLE_CONSOLE_LOG).logs;
const router = express_1.Router();
// const defaultRouter: Router = express.Router();
const reqPromise = require('request-promise');
/* GET home page. */
/*router.get('/', (req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.render('index', { title: 'Product Badge App' });
});*/
router.get('/shopify', (request, response) => {
    // log.info('inside shopify main method');
    shopController.handleAppInstall(request, response);
});
router.get('/shopify/authorizeCallback', (request, response) => {
    // response.send('in install completion callback method');
    shopController.authorizeShopifyRequest(request, response);
    // response.redirect('https://dc7a4f9d.ngrok.io/static/welcome.html');
});
/* router.get('/storeShopDetails' , (request: express.Request, response: express.Response) => {
    console.log('inside shop details store router');
    self.appController.storeShopDetails(request, response);
});
*/
router.post('/createProduct/:shopname', (request, response) => {
    shopController.createProduct(request, response);
});
router.post('/updateProduct/:shopname', (request, response) => {
    shopController.updateProduct(request, response);
});
router.post('/deleteProduct/:shopname', (request, response) => {
    shopController.deleteProduct(request, response);
});
// router.post('/getTheme', (request: Request, response: Response) => {
//   shopController.getTheme(request, response);
// });
exports.default = router;
//# sourceMappingURL=../../src/dist/routes/shop.route.js.map