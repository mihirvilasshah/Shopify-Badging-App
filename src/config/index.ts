const env: string = process.env.NODE_ENV || 'development';
const config: any = require('../config/config.' + env);

export = config;
