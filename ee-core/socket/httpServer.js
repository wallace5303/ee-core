'use strict';

const debug = require('debug')('ee-core:socket:httpServer');
const assert = require('assert');
const is = require('is-type-of');
const Koa = require('koa');
const Router = require('koa-router');
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
const { getPort } = require('../utils/port');

let channelSeparator = '/';

class HttpServer {
  constructor() {
    const { httpServer, mainServer } = getConfig();
    this.config = httpServer;
    channelSeparator = mainServer.channelSeparator;
    this.httpApp = undefined;
    this.init();
  }

  async init() {
    if (this.config.enable === false) {
      return;
    }

    const port = await getPort({ port: parseInt(this.config.port) });
    if (!port) {
      throw new Error('[ee-core] [socket/HttpServer] http port required, and must be a number !');
    }
    process.env.EE_HTTP_PORT = port;
    this.config.port = port;

    this._create();
  }

  /**
   * 创建服务
   */
  _create() {
    const config = this.config;
    const koaConfig = config.koaConfig || {};
    const { 
      preMiddleware = [], 
      postMiddleware = [], 
      errorHandler = null, 
      router = [] 
    } = koaConfig;
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
    const routerInstance = new Router();

    // 设置错误处理器
    this._setupErrorHandler(koaApp, errorHandler);

    // 加载前置中间件
    this._loadMiddlewares(koaApp, preMiddleware);

    // 注册路由
    this._registerRoutes(routerInstance, router);

    // 核心中间件
    koaApp
      .use(cors(corsOptions))
      .use(koaBody(config.body))
      .use(routerInstance.routes())
      .use(routerInstance.allowedMethods())
      .use(this._dispatch.bind(this));

    // 加载后置中间件
    this._loadMiddlewares(koaApp, postMiddleware, 'post');

    let msg = '[ee-core] [socket/http] server is: ' + url;
    const listenOpt = {
      host: config.host,
      port: config.port
    };

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

    this.httpApp = koaApp;
  }

  /**
   * 通用函数查找器
   * @param {String} uriPath 函数路径
   * @param {String} type 类型（用于日志）
   * @returns {Function|null}
   */
  _findFunction(uriPath, type = 'controller') {
    if (!uriPath) return null;
    if (uriPath.indexOf('/') === 0) {
      uriPath = uriPath.substring(1);
    }
    if (!uriPath.startsWith('controller/httpServer')) {
      uriPath = 'controller/httpServer/' + uriPath;
    }

    try {
      const controller = getController();
      const actions = uriPath.split(channelSeparator);
      let fn = null;
      if (is.string(uriPath)) {
        let obj = { controller };
        actions.forEach(key => {
          obj = obj[key];
          if (!obj) throw new Error(`class or function '${key}' not exists`);
        });
        fn = obj;
      }

      return is.function(fn) ? fn : null;
    } catch (err) {
      coreLogger.error(`[ee-core/httpServer] Error finding ${type}: ${uriPath}`, err);
      return null;
    }
  }

  /**
   * 注册路由
   * @param {Router} router koa-router实例
   * @param {Array} routes 路由配置
   */
  _registerRoutes(router, routes) {
    if (!is.array(routes)) return;

    routes.forEach(route => {
      const { api, method = 'get', controller, middlewares = [] } = route;
      
      if (!api || !controller) {
        coreLogger.warn('[ee-core/httpServer] Invalid route config, api and controller are required');
        return;
      }

      const httpMethod = method.toLowerCase();
      if (!['get', 'post', 'put', 'delete', 'patch', 'head', 'options'].includes(httpMethod)) {
        coreLogger.warn(`[ee-core/httpServer] Invalid HTTP method: ${method} for route: ${api}`);
        return;
      }

      const routeMiddlewares = middlewares
        .map(name => this._findFunction(name, 'middleware'))
        .filter(Boolean);

      routeMiddlewares.push(async (ctx, next) => {
        try {
          const controllerFn = this._findFunction(controller);
          if (!controllerFn) {
            ctx.status = 404;
            ctx.body = { error: 'Controller not found' };
            return;
          }

          const args = httpMethod === 'get' ? ctx.request.query : ctx.request.body;
          const result = await controllerFn.call(null, args, ctx);
          ctx.body = result;
        } catch (err) {
          coreLogger.error('[ee-core/httpServer] route handler error:', err);
          ctx.status = 500;
          ctx.body = { error: 'Internal server error' };
        }
        await next();
      });

      router[httpMethod](api, ...routeMiddlewares);
      coreLogger.info(`[ee-core/httpServer] Registered route: [${httpMethod.toUpperCase()}] ${api} -> ${controller}`);
    });
  }

  /**
   * 路由分发（兼容旧版）
   */
  async _dispatch(ctx, next) {
    if (ctx.body !== undefined || ctx.status !== 404) {
      return await next();
    }

    const controller = getController();
    const { filterRequest } = this.config;
    let uriPath = ctx.request.path;
    const method = ctx.request.method;
    let params = ctx.request.query;
    params = is.object(params) ? JSON.parse(JSON.stringify(params)) : {};
    const body = ctx.request.body;

    ctx.response.status = 200;

    try {
      if (uriPath.indexOf('/') === 0) {
        uriPath = uriPath.substring(1);
      }

      if (_.includes(filterRequest?.uris || [], uriPath)) {
        ctx.response.body = filterRequest.returnData;
        await next();
        return;
      }

      if (!uriPath.startsWith('controller/httpServer')) {
        uriPath = 'controller/httpServer/' + uriPath;
      }

      const cmd = uriPath.split('/').join(channelSeparator);
      debug('[request] uri %s', cmd);
      const args = (method === 'POST') ? body : params;
      
      const actions = cmd.split(channelSeparator);
      debug('[findFn] channel %o', actions);
      
      let fn = null;
      if (is.string(cmd)) {
        let realCmd = cmd;
        if (this.config.koaConfig?.autoCamelCase){
          const toCamelCase = (str) => {
            return str.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
          };
          realCmd = toCamelCase(cmd);
        }
        const actions = realCmd.split(channelSeparator);
        debug('[findFn] channel %o', actions);
        let obj = { controller };
        actions.forEach(key => {
          obj = obj[key];
          if (!obj) throw new Error(`class or function '${key}' not exists`);
        });
        fn = obj;
      }
      if (!fn) throw new Error('function not exists');
      const result = await fn.call(controller, args, ctx);
      ctx.response.body = result;
    } catch (err) {
      coreLogger.error('[ee-core/httpServer] throw error:', err);
      ctx.status = 500;
      ctx.body = { error: err.message };
    }

    await next();
  }

  getHttpApp() {
    return this.httpApp;
  }

  _setupErrorHandler(app, errorHandler) {
    if (is.function(errorHandler)) {
      app.on('error', errorHandler);
    }
  }

  _loadMiddlewares(app, middlewares = [], type = 'pre') {
    if (is.array(middlewares)) {
      middlewares.forEach((middleware) => {
        if (is.function(middleware)) {
          app.use(middleware());
        } else {
          coreLogger.warn(`[ee-core/httpServer] Invalid ${type} middleware detected, skipping.`);
        }
      });
    }
  }
}

module.exports = {
  HttpServer
};
