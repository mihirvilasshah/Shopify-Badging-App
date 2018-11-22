const bodyParser: any = require('body-parser');
import * as cors from 'cors';
import * as express from 'express';
import * as path from 'path';
import * as APP_CONFIG from './config/app_config';
import angularRoute from './routes/angular.route';
import shopRoute from './routes/shop.route';
import addBadgeRoute from './routes/addBadge.route';
import publishBadgeRoute from './routes/publish.route';
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

app.use('/tricon', shopRoute);
app.use('/angular', angularRoute);
app.use('/addBadge', addBadgeRoute);
app.use('/badging', addBadgeRoute);
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, 'index.html'));
// });

app.use((err: any, req: any, res: any, next: any) => {
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

export default app;
