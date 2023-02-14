'use strict';

const EeAppCore = require('../core/index').EeCore;
const EE_PATH = Symbol.for('ee#eePath');
const path = require('path');
const EE_LOADER = Symbol.for('ee#loader');
const AppLoader = require('./appLoader');
const LOGGERS = Symbol('EeApplication#loggers');
const Log = require('../module/log');
const HttpClient = require('./httpclient');
const HTTPCLIENT = Symbol('EeApplication#httpclient');
const Storage = require('../lib/storage');

class BaseApp extends EeAppCore {
  constructor (options = {}) {

    super(options);
    
    this.HttpClient = HttpClient;

    this.loader.loadConfig();
    
    // todo
    //this.setDatabaseDir();

    // 缓存配置
    this.getCoreDB().setItem('config', this.config);

    this.loader.load();

    // TODO 这个不行，要么每次new对象，要么所有地方都用同一个实例，否则会出现数据无法刷新的情况
    //this.coreDB = this.getCoreDB();

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
      this[LOGGERS] = Log.create(this.config);
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
    const db = Storage.connection('system');
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
   * todo 设置db存储目录
   */
  setDatabaseDir (dirPath) {
    if (dirPath) {
      assert(typeof dirPath === 'string', ` ${dirPath} dirPath required, and must be a string`);
      process.env.EE_DATABASE_DIR = dirPath;
    } else {
      process.env.EE_DATABASE_DIR = this.config.database.dir;
    }
  }

  /**
   * core app have been loaded
   */
  async ready () {
    // do some things
  }
}

module.exports = BaseApp;