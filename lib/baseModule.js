'use strict';

const is = require('electron-is');
const config = require('../config');
const Storage = require('./storage');
const api = require('./api');
const ipc = require('./ipcMain');
const ELogger = require('./eLogger');
const crash = require('./crashReport');

class BaseModule {
  constructor () {
    // 存储模块
    const storageModule = new Storage();
    storageModule.setup();

    // 日志
    const eLoggerModule = new ELogger();
    eLoggerModule.setup();

    // 自动更新
    this.loadUpdate();

    // electron业务模块
    api.setup();

    // ipc模块
    ipc.setup();

    // 崩溃上报
    crash.setup();
  }

  loadUpdate () {
    const updateConfig = config.get('autoUpdate');
    if ((is.windows() && updateConfig.windows) || (is.macOS() && updateConfig.macOS)
      || (is.linux() && updateConfig.linux)) {
      const autoUpdater = require('./preferences/autoUpdater');
      autoUpdater.setup();
    }
  
    return true;
  }
}

module.exports = BaseModule;