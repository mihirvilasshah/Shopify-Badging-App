import { Request, Response, Router } from 'express';
import { ApplicationConfig as APP_CONFIG } from '../config/app_config';
import * as addBadgeController from '../controller/addBadge.controller';

const router: Router = Router();
// const defaultRouter: Router = express.Router();
router.get('/getSrc/:pid', (request: Request, response: Response) => {
  addBadgeController.getSrc(request, response);
});
router.post('/getbadges', (request: Request, response: Response) => {
  addBadgeController.getbadges(request, response);
});

const reqPromise = require('request-promise');
export default router;
