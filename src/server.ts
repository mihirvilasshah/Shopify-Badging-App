import * as debugModule from 'debug';
import * as fs from 'fs';
import * as path from 'path';
// import * as config from './config/config';
import app from './app';
import APP_CONFIG from './config/app_config';
const debug = debugModule('temp:server');
const PORT = normalizePort(process.env.PORT || APP_CONFIG.PORT || '3000');
app.set('port', PORT);

const https = require('https');
const http = require('http');

// const sslOptions = {
//   key: fs.readFileSync(path.join(__dirname, './config/ssl-cert/server.key')),
//   cert: fs.readFileSync(path.join(__dirname, './config/ssl-cert/server.crt'))
// };

const httpServer = http.createServer(app);
startServer();

/**
 * Start Express server.
 */
function startServer() {
  httpServer.listen(PORT, () => {
    console.log({
      env: process.env.NODE_ENV,
      message: 'Product Badge Backend started',
      port: PORT,
      startAt: new Date()
    });
  });

  httpServer.on('error', onError);
  httpServer.on('listening', onListening);
}

function normalizePort(val: string): string | number | boolean {
  const port = parseInt(val, 10);
  if (isNaN(port)) {
    return val;
  }
  if (port >= 0) {
    return port;
  }
  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */
function onError(error: { syscall: string; code: string }) {
  if (error.syscall !== 'listen') {
    throw error;
  }
  const bind = typeof PORT === 'string' ? 'Pipe ' + PORT : 'Port ' + PORT;
  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  const addr = httpServer.address();
  const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
  debug('Listening on ' + bind);
}
