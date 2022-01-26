'use strict';

const is = require('electron-is');
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
 
    this.coreLogger.info('[ee-core:baseApp] start loaded lib modules');

    this.storage = this.getStorage();

    //this.initApis();

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
    //const storage = require('./storage');
    // let filepath = this.loader.resolveModule(path.join(this.eeCoreDir, 'lib', 'storage.js'));
    // this.console.info('[baseApp] [getStorage] filepath:', filepath);
    // this.loader.loadFile(filepath);
    return require('./storage').getInstance();
  }

  /**
   * @class electron业务模块
   * @since 1.0.0
   */
  initSocket () {
    const socket = require('./socket');
    new socket();
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

  /**
   * @class 崩溃上报
   * @since 1.0.0
   */
  initCrash () {
    const Crash = require('./crashReport');
    Crash.getInstance().init();
  }

  /**
   * @class 自动更新
   * @since 1.0.0
   */
  loadUpdate () {
    const updateConfig = config.get('autoUpdate');
    if ((is.windows() && updateConfig.windows) || (is.macOS() && updateConfig.macOS)
      || (is.linux() && updateConfig.linux)) {
      const AutoUpdater = require('ee-core/preferences/autoUpdater');
      AutoUpdater.getInstance().init();
    }
  }
}

module.exports = BaseApp;