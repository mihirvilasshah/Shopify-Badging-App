import { Request, Response, Router } from 'express';
import { ApplicationConfig as APP_CONFIG } from '../config/app_config';
import * as publishController from '../controller/publish.controller';

const router: Router = Router();
router.post(
  '/publishBadges/:shopname',
  (request: Request, response: Response) => {
    publishController.publishBadges(request, response);
  }
);
router.post(
  '/unpublishBadges/:shopname',
  (request: Request, response: Response) => {
    publishController.unpublishBadges(request, response);
  }
);

export default router;
