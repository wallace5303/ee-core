const { app } = require('electron');
const EE = require('../../ee');
const Log = require('../../log');
const Electron = require('../index');
const UtilsIs = require('../../utils/is');
const Cross = require('../../cross');

/**
 * CoreElectronApp (框架封装的electron app对象)
 */
const CoreElectronApp = {

  /**
   * 创建electron应用
   */
  async create() {
    const { CoreApp } = EE;

    const gotTheLock = app.requestSingleInstanceLock();
    if (!gotTheLock) {
      app.quit();
    }

    app.whenReady().then(() => {
      CoreApp.createWindow();
    })

    // 显示首次打开的窗口
    app.on('second-instance', (event, argv, workingDirectory) => {
      Log.coreLogger.info('[ee-core] [lib/eeApp] second-instance');
      CoreApp.mainWindow.show();
    });

    app.on('window-all-closed', () => {
      if (!UtilsIs.macOS()) {
        Log.coreLogger.info('[ee-core] [lib/eeApp] window-all-closed quit');
        CoreApp.appQuit();
      }
    })

    app.on('before-quit', () => {
      Electron.extra.closeWindow = true;

      // kill cross services
      Cross.killAll();
    })

    if (CoreApp.config.hardGpu.enable == false) {
      app.disableHardwareAcceleration();
    }

    return app;
  },

  /**
   * 退出app
   */
  quit() {
    app.quit();
  }
}

module.exports = CoreElectronApp;
