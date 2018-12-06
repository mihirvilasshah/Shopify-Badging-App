"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config = require('../config');
const dotenv = require('dotenv').config();
class ApplicationConfig {
}
ApplicationConfig.PORT = config.PORT;
ApplicationConfig.SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY;
ApplicationConfig.KEEP_ALIVE_TIMEOUT_SEC = config.KEEP_ALIVE_TIMEOUT_SEC;
ApplicationConfig.API_VERSION = config.API_VERSION;
ApplicationConfig.APP_VERSION = 'APP_VERSION_REPLACE_BY_NODE';
ApplicationConfig.LOG_DIR = config.LOG_DIR ? config.LOG_DIR : '/logs/';
ApplicationConfig.LOG_FILE_NAME = config.LOG_FILE_NAME
    ? config.LOG_FILE_NAME
    : 'k12login-http.log';
ApplicationConfig.LOG_MAX_FILE_SIZE = config.LOG_MAX_FILE_SIZE
    ? config.LOG_MAX_FILE_SIZE
    : '20971520'; // 20MB
ApplicationConfig.LOG_NO_OF_BACKUPS = config.LOG_NO_OF_BACKUPS
    ? config.LOG_NO_OF_BACKUPS
    : '10';
ApplicationConfig.LOG_ENABLE_CONSOLE_LOG = config.LOG_ENABLE_CONSOLE_LOG
    ? config.LOG_ENABLE_CONSOLE_LOG
    : false;
ApplicationConfig.LOG_LEVEL = config.LOG_LEVEL
    ? config.LOG_LEVEL
    : 'error';
exports.ApplicationConfig = ApplicationConfig;
exports.default = ApplicationConfig;
//# sourceMappingURL=../../src/dist/config/app_config.js.map