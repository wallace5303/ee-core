'use strict';

const assert = require('assert');
const is = require('is-type-of');
const Koa = require('koa');
const cors = require('koa2-cors');
const koaBody = require('koa-body');
const https = require('https');
const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const Log = require('../log');
const Ps = require('../ps');

/**
 * http server
 */
class HttpServer {
  constructor (app) {
    this.app = app;
    this.options = this.app.config.httpServer;

    if (this.options.enable == false) {
      return;
    }

    let port = Ps.getHttpPort();
    if (!port) {
      throw new Error('[ee-core] [socket/HttpServer] http port required, and must be a number !');
    }

    this.create();
  }

  /**
   * 创建服务
   */
  create () {
    const app = this.app;
    const httpServer = this.options;
    const isHttps = httpServer?.https?.enable ?? false;
    let sslOptions = {};

    if (isHttps === true) {
      httpServer.protocol = 'https://';
      const keyFile = path.join(app.config.homeDir, httpServer.https.key);
      const certFile = path.join(app.config.homeDir, httpServer.https.cert);
      assert(fs.existsSync(keyFile), 'ssl key file is required');
      assert(fs.existsSync(certFile), 'ssl cert file is required');

      sslOptions.key = fs.readFileSync(keyFile);
      sslOptions.cert = fs.readFileSync(certFile);
    }
    const url = httpServer.protocol + httpServer.host + ':' + httpServer.port;
    const corsOptions = httpServer.cors;

    const koaApp = new Koa();
    koaApp
      .use(cors(corsOptions))
      .use(koaBody(httpServer.body))
      .use(async (ctx, next) => {
        ctx.eeApp = app;
        await next();
      })
      .use(this.dispatch);

    let msg = '[ee-core] [socket/http] server is: ' + url;

    const listenOpt = {
      host: httpServer.host,
      port: httpServer.port
    }
    if (isHttps) {
      https.createServer(sslOptions, koaApp.callback()).listen(listenOpt, (err) => {
        msg = err ? err : msg;
        Log.coreLogger.info(msg);
      });
    } else {
      koaApp.listen(listenOpt, (e) => {
        msg = e ? e : msg;
        Log.coreLogger.info(msg);
      });
    }  
  }

  /**
   * 路由分发
   */
  async dispatch (ctx, next) {
    const config = ctx.eeApp.config.httpServer;
    let uriPath = ctx.request.path;
    const method = ctx.request.method;
    let params = ctx.request.query;
    params = is.object(params) ? JSON.parse(JSON.stringify(params)) : {};
    const body = ctx.request.body;

    // 默认
    ctx.response.status = 200;

    // 添加到全局属性
    ctx.eeApp.request = ctx.request;
    ctx.eeApp.response = ctx.response;

    try {
      // 找函数
      // 去除开头的 '/'
      if (uriPath.indexOf('/') == 0) {
        uriPath = uriPath.substring(1);
      }
      // 过滤
      if (_.includes(config.filterRequest.uris, uriPath)) {
        ctx.response.body = config.filterRequest.returnData;
        await next();
        return
      }
      if (uriPath.slice(0, 10) != 'controller') {
        uriPath = 'controller/' + uriPath;
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
      ctx.response.body = result;
    } catch (err) {
      Log.coreLogger.error('[ee-core/httpServer] throw error:', err);
    }

    await next();
  }
}

module.exports = HttpServer;