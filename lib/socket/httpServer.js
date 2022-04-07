'use strict';

const assert = require('assert');
const { Server } = require('socket.io');
const constant = require('../constant');
const EggConsoleLogger = require('egg-logger').EggConsoleLogger;
const is = require('is-type-of');

/**
 * http server
 */
class HttpServer {
  constructor (app) {
    let port = process.env.EE_SOCKET_PORT ? parseInt(process.env.EE_SOCKET_PORT) : parseInt(this.getSocketcPort());

    assert(typeof port === 'number', 'port required, and must be a number');

    this.app = app;
    this.consoleLogger = new EggConsoleLogger();
    this.consoleLogger.info('[ee-core:socket:server] start server, socket port is:', port);

    this.create();
  }

  create () {

  }

}

module.exports = HttpServer;