"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const publishController = require("../controller/publish.controller");
const router = express_1.Router();
router.post('/publishBadges/:shopname', (request, response) => {
    publishController.publishBadges(request, response);
});
router.post('/unpublishBadges/:shopname', (request, response) => {
    publishController.unpublishBadges(request, response);
});
exports.default = router;
//# sourceMappingURL=../../src/dist/routes/publish.route.js.map