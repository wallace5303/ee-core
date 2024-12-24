'use strict';

const debug = require('debug')('ee-core:electron:app');
const { app: electronApp } = require('electron');
const { coreLogger } = require('../../log');
const UtilsIs = require('../../utils/is');
// const Cross = require('../../cross');
const { createMainWindow, setCloseAndQuit, loadServer } = require('../window');
const { getApp, ElectronAppReady, BeforeClose, Preload } = require('../../app/application');
const { getConfig } = require('../../config');

/**
 * 创建electron应用
 */
function createElectron() {
  const app = getApp();
  const { singleLock } = getConfig();
  // [todo] 允许多个实例 
  const gotTheLock = electronApp.requestSingleInstanceLock();
  if (singleLock && !gotTheLock) {
    electronApp.quit();
  }
  
  // [todo] 显示首次打开的窗口
  // electronApp.on('second-instance', () => {
  //   Log.coreLogger.info('[ee-core] [lib/eeApp] second-instance');
  //   Window.restoreMainWindow();
  // });

  electronApp.whenReady().then(() => {
    createMainWindow();
    // [todo] _loderPreload 、 selectAppType
    app.callEvent(Preload);
    loadServer();
  })

  electronApp.on('window-all-closed', () => {
    if (!UtilsIs.macOS()) {
      coreLogger.info('[ee-core] [lib/eeApp] window-all-closed quit');
      electronApp.quit(); 
    }
  })

  electronApp.on('before-quit', () => {
    setCloseAndQuit(true);
    // [todo] before quit app
    // [todo] kill cross services
    // Cross.killAll();
    app.callEvent(BeforeClose);
  })

  
  app.callEvent(ElectronAppReady);
}

module.exports = {
  electronApp,
  createElectron,
};
