const config = require('../config');
const dotenv = require('dotenv').config();

export class ApplicationConfig {
  public static PORT: string = config.PORT;
  public static SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY;
  public static KEEP_ALIVE_TIMEOUT_SEC: number = config.KEEP_ALIVE_TIMEOUT_SEC;
  public static API_VERSION: string = config.API_VERSION;
  public static APP_VERSION = 'APP_VERSION_REPLACE_BY_NODE';
  public static LOG_DIR: string = config.LOG_DIR ? config.LOG_DIR : '/logs/';
  public static LOG_FILE_NAME: string = config.LOG_FILE_NAME
    ? config.LOG_FILE_NAME
    : 'k12login-http.log';
  public static LOG_MAX_FILE_SIZE: string = config.LOG_MAX_FILE_SIZE
    ? config.LOG_MAX_FILE_SIZE
    : '20971520'; // 20MB
  public static LOG_NO_OF_BACKUPS: string = config.LOG_NO_OF_BACKUPS
    ? config.LOG_NO_OF_BACKUPS
    : '10';
  public static LOG_ENABLE_CONSOLE_LOG: boolean = config.LOG_ENABLE_CONSOLE_LOG
    ? config.LOG_ENABLE_CONSOLE_LOG
    : false;
  public static LOG_LEVEL: boolean = config.LOG_LEVEL
    ? config.LOG_LEVEL
    : 'error';
}

export default ApplicationConfig;
