'use strict';

const is = require('electron-is');
const EeAppCore = require('../core/index').EeCore;

class BaseModule extends EeAppCore {
  constructor (options = {}) {

    super(options);
    

  }

  /**
   * @class 存储模块
   * @since 1.0.0
   */
  initStorage () {
    const storage = require('./storage');
    storage.getInstance().init();
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

module.exports = BaseModule;