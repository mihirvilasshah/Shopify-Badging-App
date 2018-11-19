// import * as express from 'express';
import { Request, Response, Router } from 'express';
import { ApplicationConfig as APP_CONFIG } from '../../config/app_config';
import * as shopController from '../controller/shop.controller';
// const log = require('../util/winston').getLogger(APP_CONFIG.LOG_ENABLE_CONSOLE_LOG).logs;

const router: Router = Router();
// const defaultRouter: Router = express.Router();

const reqPromise = require('request-promise');

/* GET home page. */
/*router.get('/', (req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.render('index', { title: 'Product Badge App' });
});*/

router.get('/shopify', (request: Request, response: Response) => {
  // log.info('inside shopify main method');
  shopController.handleAppInstall(request, response);
});

router.get(
  '/shopify/authorizeCallback',
  (request: Request, response: Response) => {
    // response.send('in install completion callback method');
    shopController.authorizeShopifyRequest(request, response);
    // response.redirect('https://dc7a4f9d.ngrok.io/static/welcome.html');
  }
);

/* router.get('/storeShopDetails' , (request: express.Request, response: express.Response) => {
    console.log('inside shop details store router');
    self.appController.storeShopDetails(request, response);
});
*/

router.post(
  '/createProduct/:shopname',
  (request: Request, response: Response) => {
    shopController.createProduct(request, response);
  }
);

router.post(
  '/updateProduct/:shopname',
  (request: Request, response: Response) => {
    shopController.updateProduct(request, response);
  }
);

router.post(
  '/deleteProduct/:shopname',
  (request: Request, response: Response) => {
    shopController.deleteProduct(request, response);
  }
);

// router.post('/getTheme', (request: Request, response: Response) => {
//   shopController.getTheme(request, response);
// });

export default router;
