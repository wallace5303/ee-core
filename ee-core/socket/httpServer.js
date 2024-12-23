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
const { coreLogger } = require('../log');
const { getBaseDir } = require('../ps');
const { getController } = require('../controller');
const { getConfig } = require('../config');

/**
 * http server
 */
class HttpServer {
  constructor () {
    this.config = getConfig().httpServer;
    this.init();
  }

  async init() {
    if (this.config.enable == false) {
      return;
    }

    const port = await getPort({port: parseInt(this.config.port)});
    if (!port) {
      throw new Error('[ee-core] [socket/HttpServer] http port required, and must be a number !');
    }
    process.env.EE_HTTP_PORT = port;
    this.config.port = httpPort;

    this._create();
  }

  /**
   * 创建服务
   */
  _create () {
    const config = this.config;
    const isHttps = config?.https?.enable ?? false;
    const sslOptions = {};

    if (isHttps === true) {
      config.protocol = 'https://';
      const keyFile = path.join(getBaseDir(), config.https.key);
      const certFile = path.join(getBaseDir(), config.https.cert);
      assert(fs.existsSync(keyFile), 'ssl key file is required');
      assert(fs.existsSync(certFile), 'ssl cert file is required');

      sslOptions.key = fs.readFileSync(keyFile);
      sslOptions.cert = fs.readFileSync(certFile);
    }
    const url = config.protocol + config.host + ':' + config.port;
    const corsOptions = config.cors;

    const koaApp = new Koa();
    koaApp
      .use(cors(corsOptions))
      .use(koaBody(config.body))
      .use(this._dispatch);

    let msg = '[ee-core] [socket/http] server is: ' + url;
    const listenOpt = {
      host: config.host,
      port: config.port
    }
    if (isHttps) {
      https.createServer(sslOptions, koaApp.callback()).listen(listenOpt, (err) => {
        msg = err ? err : msg;
        coreLogger.info(msg);
      });
    } else {
      koaApp.listen(listenOpt, (e) => {
        msg = e ? e : msg;
        coreLogger.info(msg);
      });
    }  
  }

  /**
   * 路由分发
   */
  async _dispatch (ctx, next) {
    const controller = getController();
    const config = getConfig().httpServer;
    let uriPath = ctx.request.path;
    const method = ctx.request.method;
    let params = ctx.request.query;
    params = is.object(params) ? JSON.parse(JSON.stringify(params)) : {};
    const body = ctx.request.body;
    const files = ctx.request.files;

    // 默认
    ctx.response.status = 200;

    // [todo] 添加到全局属性
    // ctx.eeApp.request = ctx.request;
    // ctx.eeApp.response = ctx.response;

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
      const args = (method == 'POST') ? (ctx.request.header['content-type'] && ctx.request.header['content-type'].startsWith('multipart/form-data;') ? files : body) : params;
      args.files = ctx.request.files;
      args.body = ctx.request.body;
      args.query = ctx.request.query;
      let fn = null;
      if (is.string(cmd)) {
        const actions = cmd.split('.');
        let obj = { controller };
        actions.forEach(key => {
          obj = obj[key];
          if (!obj) throw new Error(`class or function '${key}' not exists`);
        });
        fn = obj;
      }
      if (!fn) throw new Error('function not exists');

      const result = await fn.call(controller, args);
      ctx.response.body = result;
    } catch (err) {
      coreLogger.error('[ee-core/httpServer] throw error:', err);
    }

    await next();
  }
}

module.exports = {
  HttpServer
};
