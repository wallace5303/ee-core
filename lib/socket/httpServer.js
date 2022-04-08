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

  /**
   * 创建服务
   */
  create () {
    const self = this;
    const httpServer = this.app.config.httpServer;
    const url = httpServer.protocol + httpServer.host + ':' + httpServer.port;

    const koaApp = new Koa();
    const bodyparser= new BodyParser();

    koaApp
      .use(cors({
        origin: function(ctx) {
          // if (ctx.url === '/test') {
          //     return '*'; // 允许来自所有域名请求
          // }
          return '*';
        },
      }))
      .use(bodyparser)
      .use(async (ctx, next) => {
        ctx.eeApp = self.app;
        await next();
      })
      .use(this.dispatch);

    koaApp.listen(httpServer.port, () => {
      self.app.coreLogger.info('[ee-core:http:server] http server is:', url);
    });
  }

  /**
   * 路由分发
   */
  async dispatch (ctx, next) {
    const path = ctx.request.path;
    const method = ctx.request.method;
    const params = ctx.request.query;
    const body = ctx.request.body;
    console.log('[ee-core:http:server] [dispatch] path:', path);
    console.log('[ee-core:http:server] [dispatch] method:', method);
    console.log('[ee-core:http:server] [dispatch] params:', params);
    console.log('[ee-core:http:server] [dispatch] body:', body);
    // this.app.request = ctx.request;
    // this.app.response = ctx.response;
    console.log('[ee-core:http:server] [dispatch] this.app.request:', ctx.eeApp.config.httpServer);
    // console.log('[ee-core:http:server] [dispatch] this.app.request:', ctx.eeApp.request);
    // console.log('[ee-core:http:server] [dispatch] this.app.response:', ctx.eeApp.response);

    await next();
  }

  /**
   * 获取http端口
   */  
  getHttpPort () {
    const cdb = this.getCoreDB();
    const port = cdb.getItem('config').httpServer.port;
    return parseInt(port);
  } 
}

module.exports = HttpServer;