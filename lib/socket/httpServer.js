'use strict';

const assert = require('assert');
const EggConsoleLogger = require('egg-logger').EggConsoleLogger;
const is = require('is-type-of');
const Koa = require('koa');

/**
 * http server
 */
class HttpServer {
  constructor (app) {
    let port = process.env.EE_HTTP_PORT ? parseInt(process.env.EE_HTTP_PORT) : parseInt(this.getHttpPort());

    assert(typeof port === 'number', 'http port required, and must be a number');

    this.app = app;
    this.consoleLogger = new EggConsoleLogger();
    this.consoleLogger.info('[ee-core:http:server] start server, http port is:', port);

    this.create();
  }

  create () {
    const httpServer = this.app.config.httpServer;
    const url = httpServer.protocol + httpServer.host + ':' + httpServer.port;

    const koaApp = new Koa();	
    koaApp.listen(httpServer.port, () => {
      self.loadMainUrl(mode, url);
    });
  }

  getHttpPort () {
    const cdb = this.getCoreDB();
    const port = cdb.getItem('config').httpServer.port;
    return parseInt(port);
  }  
}

module.exports = HttpServer;