// import * as express from 'express';
import { Request, Response, Router } from 'express';
import { ApplicationConfig as APP_CONFIG } from '../../config/app_config';
import * as angularController from '../controller/angular.controller';
// const log = require('../util/winston').getLogger(APP_CONFIG.LOG_ENABLE_CONSOLE_LOG).logs;

const router: Router = Router();
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
router.get('/getMyBadges/:shopname', (request: Request, response: Response) => {
  angularController.getMybadges(request, response);
});
router.get(
  '/getMyLibrary/:shopname',
  (request: Request, response: Response) => {
    angularController.getMyLibrary(request, response);
  }
);
// get the badge picture
router.get(
  '/picture/:picture/:shopname',
  (request: Request, response: Response) => {
    angularController.getPicture(request, response);
  }
);
router.get('/getProduct/:id', (request: Request, response: Response) => {
  angularController.getProduct(request, response);
});
router.get('/getIDS/:shopname', (request: Request, response: Response) => {
  angularController.getIDS(request, response);
});
router.get('/getUserIDS', (request: Request, response: Response) => {
  angularController.getUserIDS(request, response);
});
router.get('/getSrc/:pid', (request: Request, response: Response) => {
  angularController.getSrc(request, response);
});
router.post('/getbadges', (request: Request, response: Response) => {
  angularController.getbadges(request, response);
});
router.get(
  '/getProductPriceRange/:shopname/:p1/:p2/:pr',
  (request: Request, response: Response) => {
    angularController.getProductPriceRange(request, response);
  }
);
router.get(
  '/getProductDateRange/:shopname/:d1/:d2/:dr',
  (request: Request, response: Response) => {
    angularController.getProductDateRange(request, response);
  }
);
router.get(
  '/getProductTitle/:shopname/:t1/:tr',
  (request: Request, response: Response) => {
    angularController.getProductTitle(request, response);
  }
);
router.get(
  '/getProductTag/:shopname/:tg1/:tr',
  (request: Request, response: Response) => {
    angularController.getProductTag(request, response);
  }
);
router.post(
  '/publishBadges/:shopname',
  (request: Request, response: Response) => {
    angularController.publishBadges(request, response);
  }
);
router.post(
  '/deleteUserBadge/:shopname',
  (request: Request, response: Response) => {
    angularController.deleteBadge(request, response);
  }
);
router.post(
  '/unpublishBadges/:shopname',
  (request: Request, response: Response) => {
    angularController.unpublishBadges(request, response);
  }
);
router.post(
  '/api/upload/:shopname',
  upload.single('photo'),
  (request: Request, response: Response) => {
    angularController.upload(request, response);
  }
);
router.get('tags/:shopname', (request: Request, response: Response) => {
  angularController.tags(request, response);
});
router.get('/currency/:shopname', (request: Request, response: Response) => {
  angularController.currency(request, response);
});

export default router;
