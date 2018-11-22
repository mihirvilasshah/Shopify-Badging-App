"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const addBadgeController = require("../controller/addBadge.controller");
const router = express_1.Router();
// const defaultRouter: Router = express.Router();
router.get('/getSrc/:pid', (request, response) => {
    addBadgeController.getSrc(request, response);
});
router.post('/getbadges', (request, response) => {
    addBadgeController.getbadges(request, response);
});
const reqPromise = require('request-promise');
exports.default = router;
//# sourceMappingURL=../../src/dist/routes/addBadge.route.js.map