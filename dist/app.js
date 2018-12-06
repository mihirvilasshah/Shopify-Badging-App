"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bodyParser = require('body-parser');
const cors = require("cors");
const express = require("express");
const path = require("path");
const angular_route_1 = require("./routes/angular.route");
const shop_route_1 = require("./routes/shop.route");
const addBadge_route_1 = require("./routes/addBadge.route");
const getproducts_route_1 = require("./routes/getproducts.route");
const winston = require('winston');
const morgan = require('morgan');
const fs = require('fs');
const rfs = require('rotating-file-stream');
const nonce = require('nonce');
const request = require('request-promise');
const querystring = require('querystring');
// Create Express server
const app = express();
// Express configuration
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/Badges', express.static('Badges'));
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
// app.use(express.static(path.join(__dirname, 'public')));
app.use('/static', express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));
// app.use('/static', express.static('public'));
app.use(cors());
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With');
    next();
});
// enable both http/https
app.enable('trust proxy');
// app.use('ngapp', express.static(path.join(__dirname, '../stat/badger')));
// console.log(process.env);
/**
 * App routes.
 */
// index page
app.get('/', (req, res) => {
    res.send('Tricon Badge App is Started...');
});
app.use('/tricon', shop_route_1.default);
app.use('/angular', angular_route_1.default);
app.use('/addBadge', addBadge_route_1.default);
app.use('/badging', addBadge_route_1.default);
app.use('/getproducts', getproducts_route_1.default);
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, 'index.html'));
// });
app.use((err, req, res, next) => {
    if (err.isBoom) {
        return res.status(err.output.statusCode).json(err.output.payload);
    }
});
process.on('unhandledRejection', error => {
    console.error('Unhandled Promise Rejection: ', error);
});
process.on('uncaughtException', error => {
    console.error('uncaught Exception: ', error);
});
exports.default = app;
//# sourceMappingURL=../src/dist/app.js.map