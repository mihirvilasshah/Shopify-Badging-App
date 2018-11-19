"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const debugModule = require("debug");
// import * as config from './config/config';
const app_1 = require("./app");
const app_config_1 = require("./config/app_config");
const debug = debugModule('temp:server');
const PORT = normalizePort(process.env.PORT || app_config_1.default.PORT || '3000');
app_1.default.set('port', PORT);
const https = require('https');
const http = require('http');
// const sslOptions = {
//   key: fs.readFileSync(path.join(__dirname, './config/ssl-cert/server.key')),
//   cert: fs.readFileSync(path.join(__dirname, './config/ssl-cert/server.crt'))
// };
const httpServer = http.createServer(app_1.default);
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
function normalizePort(val) {
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
function onError(error) {
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
//# sourceMappingURL=../src/dist/server.js.map