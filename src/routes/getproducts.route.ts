// import * as express from 'express';
import { Request, Response, Router } from 'express';
import { ApplicationConfig as APP_CONFIG } from '../config/app_config';
import * as getProducts from '../controller/getproducts.controller';

const router: Router = Router();
router.get(
  '/getProductPriceRange/:shopname/:p1/:p2/:pr',
  (request: Request, response: Response) => {
    getProducts.getProductPriceRange(request, response);
  }
);
// router.get(
//   '/getProductDiscountRange/:shopname/:d1/:pr',
//   (request: Request, response: Response) => {
//     getProducts.getProductDiscountRange(request, response);
//   }
// );
router.get(
  '/getProductDateRange/:shopname/:d1/:d2/:dr',
  (request: Request, response: Response) => {
    getProducts.getProductDateRange(request, response);
  }
);
router.get(
  '/getProductTitle/:shopname/:t1/:tr',
  (request: Request, response: Response) => {
    getProducts.getProductTitle(request, response);
  }
);
router.get(
  '/getProductTag/:shopname/:tg1/:tr',
  (request: Request, response: Response) => {
    getProducts.getProductTag(request, response);
  }
);
export default router;
