'use strict';

const EeAppCore = require('../core/index').EeCore;
const EE_PATH = Symbol.for('ee#eePath');
const path = require('path');
const EE_LOADER = Symbol.for('ee#loader');
const AppLoader = require('./appLoader');
const LOGGERS = Symbol('EeApplication#loggers');
const ELoggers = require('./logger');

class BaseApp extends EeAppCore {
  constructor (options = {}) {

    super(options);
    
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

    // const fullpath = path.join(__dirname, './socket/create');
    // this.loader.loadFile(fullpath);

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
   * @class electron业务模块
   * @since 1.0.0
   */
  initApis () {
    const api = require('./api');
    api.getInstance().init();
  }

  /**
   * @class ipc模块
   * @since 1.0.0
   */
  initIpcMain () {
    const ipcMain = require('./ipcMain');
    ipcMain.getInstance().init();
  }
}

module.exports = BaseApp;