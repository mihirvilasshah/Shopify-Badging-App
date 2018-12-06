"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// import * as express from 'express';
const express_1 = require("express");
const getProducts = require("../controller/getproducts.controller");
const router = express_1.Router();
router.get('/getProductPriceRange/:shopname/:p1/:p2/:pr', (request, response) => {
    getProducts.getProductPriceRange(request, response);
});
// router.get(
//   '/getProductDiscountRange/:shopname/:d1/:pr',
//   (request: Request, response: Response) => {
//     getProducts.getProductDiscountRange(request, response);
//   }
// );
router.get('/getProductDateRange/:shopname/:d1/:d2/:dr', (request, response) => {
    getProducts.getProductDateRange(request, response);
});
router.get('/getProductTitle/:shopname/:t1/:tr', (request, response) => {
    getProducts.getProductTitle(request, response);
});
router.get('/getProductTag/:shopname/:tg1/:tr', (request, response) => {
    getProducts.getProductTag(request, response);
});
exports.default = router;
//# sourceMappingURL=../../src/dist/routes/getproducts.route.js.map