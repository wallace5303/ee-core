'use strict';

const assert = require('assert');
const EggConsoleLogger = require('egg-logger').EggConsoleLogger;
const is = require('is-type-of');
const Koa = require('koa');
const Router = require('koa-router');
const BodyParser = require('koa-bodyparser');
const cors = require('koa-cors');

/**
 * http server
 */
class HttpServer {
  constructor (app) {
    this.app = app;
    const options = this.app.config.httpServer;
    const socketOptions = this.app.config.socketServer;
    this.consoleLogger = new EggConsoleLogger();

    if (!socketOptions.enable || !options.enable) {
      return;
    }

    let port = process.env.EE_HTTP_PORT ? parseInt(process.env.EE_HTTP_PORT) : parseInt(this.getHttpPort());
    assert(typeof port === 'number', 'http port required, and must be a number');

    this.create();
  }

  create () {
    const self = this;
    const httpServer = this.app.config.httpServer;
    const url = httpServer.protocol + httpServer.host + ':' + httpServer.port;

    const koaApp = new Koa();
    const bodyparser= new BodyParser();

    // 对于任何请求，app将调用该异步函数处理请求：
    koaApp.use(async (ctx, next) => {
      console.log(`Process ${ctx.request.method} ${ctx.request.url}...`);
      await next();
    });

    koaApp
      .use(cors({
        origin: function(ctx) {
          // if (ctx.url === '/test') {
          //     return '*'; // 允许来自所有域名请求
          // }
          return '*';
        },
      }))
      .use(bodyparser);

    koaApp.listen(httpServer.port, () => {
      self.app.coreLogger.info('[ee-core:http:server] http server is:', url);
    });
  }

  getHttpPort () {
    const cdb = this.getCoreDB();
    const port = cdb.getItem('config').httpServer.port;
    return parseInt(port);
  } 
}

module.exports = HttpServer;