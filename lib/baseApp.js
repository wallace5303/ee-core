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

    this.storage = this.getStorage();

    // 缓存配置
    this.storage.setItem('config', this.config);
 
    this.coreLogger.info('[ee-core:baseApp] start loaded lib modules');

    this.initSocket();
    console.log('vvvvvvvvvv');
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
   * @class 存储模块
   * @since 1.0.0
   */
  getStorage () {
    const LowdbStorage = require('./storage/lowdbStorage');
    const storage = new LowdbStorage('system');
    return storage;
  }

  /**
   * @class 初始化通信模块
   * @since 1.0.0
   */
  initSocket () {
    const InitSocket = require('./socket/initSocket');
    new InitSocket();
    return;
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