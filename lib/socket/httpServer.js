'use strict';

const assert = require('assert');
const is = require('is-type-of');
const Koa = require('koa');
const BodyParser = require('koa-bodyparser');
const cors = require('koa2-cors');

/**
 * http server
 */
class HttpServer {
  constructor (app) {
    this.app = app;
    const options = this.app.config.httpServer;

    if (!options.enable) {
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
    let uriPath = ctx.request.path;
    const method = ctx.request.method;
    let params = ctx.request.query;
    params = is.object(params) ? JSON.parse(JSON.stringify(params)) : {};
    const body = ctx.request.body;
    // 添加到全局属性
    ctx.eeApp.request = ctx.request;
    ctx.eeApp.response = ctx.response;

    try {
      // 找函数
      if (uriPath.indexOf('/') !== -1) {
        uriPath = uriPath.substring(1);
      }
      const cmd = uriPath.split('/').join('.');
      const args = (method == 'POST') ? body : params;
      let fn = null;
      if (is.string(cmd)) {
        const actions = cmd.split('.');
        let obj = ctx.eeApp;
        actions.forEach(key => {
          obj = obj[key];
          if (!obj) throw new Error(`class or function '${key}' not exists`);
        });
        fn = obj;
      }
      if (!fn) throw new Error('function not exists');

      const result = await fn.call(ctx.eeApp, args);
      ctx.response.status = 200;
      ctx.response.body = result;
    } catch (err) {
      ctx.eeApp.console.error('[ee-core:http:server] throw error:', err);
    }

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