'use strict';

const EeAppCore = require('../core/index').EeCore;
const EE_PATH = Symbol.for('ee#eePath');
const path = require('path');
const EE_LOADER = Symbol.for('ee#loader');
const AppLoader = require('./appLoader');
const LOGGERS = Symbol('EeApplication#loggers');
const ELoggers = require('./logger');
const HttpClient = require('./httpclient');
const HTTPCLIENT = Symbol('EeApplication#httpclient');

class BaseApp extends EeAppCore {
  constructor (options = {}) {

    super(options);
    
    this.HttpClient = HttpClient;

    try {
      this.loader.loadConfig();
      this.loader.load();
    } catch (e) {
      throw e;
    }

    // this.jsonDB = this.getJsonDB();

    // const a = this.jsonDB.connection('system');
    // const b = this.jsonDB.connection('system');

    // console.log('a---------b:', Object.is(a,b));

    // TODO 这个不行，要么每次new对象，要么所有地方都用同一个实例，否则会出现数据无法刷新的情况
    //this.coreDB = this.getCoreDB();

    // 缓存配置
    this.getCoreDB().setItem('config', this.config);
 
    this.coreLogger.info('[ee-core:baseApp] start loaded lib modules');

  }

  get [EE_PATH]() {
    return path.join(__dirname, '..');
  }

  get [EE_LOADER]() {
    return AppLoader;
  }

  /**
   *  loggers
   * @member {Object}
   * @since 1.0.0
   */
  get loggers() {
    if (!this[LOGGERS]) {
      this[LOGGERS] = ELoggers.getInstance(this.config);
    }
    return this[LOGGERS];
  }

  /**
   * Get logger by name, it's equal to app.loggers['name'],
   * but you can extend it with your own logical.
   * @param {String} name - logger name
   * @return {Logger} logger
   */
  getLogger(name) {
    return this.loggers[name] || null;
  }

  /**
   * application logger, log file is `$HOME/logs/ee.log`
   * @member {Logger}
   * @since 1.0.0
   */
  get logger() {
    return this.getLogger('logger');
  }

  /**
   * core logger for framework and plugins, log file is `$HOME/logs/ee-core.log`
   * @member {Logger}
   * @since 1.0.0
   */
  get coreLogger() {
    return this.getLogger('coreLogger');
  }

  /**
   * @class core存储模块
   * @since 1.0.0
   */
  getCoreDB () {
    const db = require('./storage/index').JsonDB.connection('system');
    return db;
  }
  
  /**
   * @class curl
   * @since 1.0.0
   */
  curl(url, opts) {
    return this.httpclient.request(url, opts);
  }

  /**
   * HttpClient instance
   * @see https://github.com/node-modules/urllib
   * @member {HttpClient}
   */
  get httpclient() {
    if (!this[HTTPCLIENT]) {
      this[HTTPCLIENT] = new this.HttpClient(this);
    }
    return this[HTTPCLIENT];
  }

  /**
   * 调用 egg api
   */
  async curlEgg (method, uri, params, timeout = 15000) {
    let result = null;
    try {
      const port = this.config.egg.port;
      const url = "http://127.0.0.1:" + port + uri;
      // console.log('[ee:baseApp] [curlEgg] url:', url);
      const response = await this.curl(url, {
        method: method,
        contentType: 'application/json',
        data: params,
        dataType: 'json',
        timeout: timeout,
      });
      result = response.data;
    } catch (err) {
      this.logger.error('[ee:baseApp] [curlEgg] throw error:', err);
    }

    return result; 
  }

  /**
   * @class socket模块
   * @since 1.0.0
   */
  get socket () {
    const obj = {
      ipc: {},
      server: {}
    }
    return obj;
  }

  /**
   * core app have been loaded
   */
  async ready () {
    // do some things
  }
}

module.exports = BaseApp;