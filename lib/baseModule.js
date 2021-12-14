'use strict';

const is = require('electron-is');
const storage = require('./storage');
const config = require('./config');
const api = require('./api');
const ipcMain = require('./ipcMain');
const Crash = require('./crashReport');

class BaseModule {
  constructor (options = {}) {
    // 存储模块
    storage.getInstance().init();

    // electron业务模块
    api.getInstance().init();

    // ipc模块
    ipcMain.getInstance().init();

    // 崩溃上报
    Crash.getInstance.init();

    // 自动更新
    this.loadUpdate();
  }

  loadUpdate () {
    const updateConfig = config.get('autoUpdate');
    if ((is.windows() && updateConfig.windows) || (is.macOS() && updateConfig.macOS)
      || (is.linux() && updateConfig.linux)) {
      const AutoUpdater = require('./preferences/autoUpdater');
      AutoUpdater.getInstance().init();
    }
  }
}

module.exports = BaseModule;