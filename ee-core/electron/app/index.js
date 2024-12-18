'use strict';

const { app: electronApp } = require('electron');
const Log = require('../../log');
const UtilsIs = require('../../utils/is');
// const Cross = require('../../cross');
const { createMainWindow, setCloseAndQuit } = require('../window');


/**
 * 创建electron应用
 */
function createElectron() {
  // [todo] 允许多个实例 
  const gotTheLock = app.requestSingleInstanceLock();
  if (!gotTheLock) {
    electronApp.quit();
  }
  // [todo] 显示首次打开的窗口
  // electronApp.on('second-instance', () => {
  //   Log.coreLogger.info('[ee-core] [lib/eeApp] second-instance');
  //   Window.restoreMainWindow();
  // });

  electronApp.whenReady().then(() => {
    createMainWindow();
    // [todo] windowReady、_loderPreload 、 selectAppType
  })

  electronApp.on('window-all-closed', () => {
    if (!UtilsIs.macOS()) {
      Log.coreLogger.info('[ee-core] [lib/eeApp] window-all-closed quit');
      // [todo] before quit app
      electronApp.quit(); 
    }
  })

  electronApp.on('before-quit', () => {
    setCloseAndQuit(true);

    // [todo] kill cross services
    // Cross.killAll();
  })

  return app;
}

module.exports = {
  electronApp,
  createElectron,
};
