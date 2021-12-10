'use strict';

const is = require('electron-is');
const config = require('../config');
const Storage = require('./storage');
const Api = require('./api');
const IpcMain = require('./ipcMain');
const ELogger = require('./eLogger');
const Crash = require('./crashReport');

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
    const apiModule = new Api();
    apiModule.setup();

    // ipc模块
    const ipcMainModule = new IpcMain();
    ipcMainModule.setup();

    // 崩溃上报
    const crashModule = new Crash();
    crashModule.setup();
  }

  loadUpdate () {
    const updateConfig = config.get('autoUpdate');
    if ((is.windows() && updateConfig.windows) || (is.macOS() && updateConfig.macOS)
      || (is.linux() && updateConfig.linux)) {
      const AutoUpdater = require('./preferences/autoUpdater');
      const autoUpdaterModule = new AutoUpdater();
      autoUpdaterModule.setup();
    }
  
    return true;
  }
}

module.exports = BaseModule;