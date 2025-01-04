'use strict';

const debug = require('debug')('ee-core:electron:app');
const { app: electronApp } = require('electron');
const { coreLogger } = require('../../log');
const { is } = require('../../utils');
const { cross } = require('../../cross');
const { createMainWindow, setCloseAndQuit, loadServer } = require('../window');
const { getApp, ElectronAppReady, BeforeClose, Preload } = require('../../app/application');
const { getConfig } = require('../../config');

/**
 * 创建electron应用
 */
function createElectron() {
  const app = getApp();
  const { singleLock } = getConfig();
  // 允许多个实例 
  const gotTheLock = electronApp.requestSingleInstanceLock();
  if (singleLock && !gotTheLock) {
    electronApp.quit();
  }

  electronApp.whenReady().then(() => {
    createMainWindow();
    app.callEvent(Preload);
    loadServer();
  })

  electronApp.on('window-all-closed', () => {
    if (!is.macOS()) {
      coreLogger.info('[ee-core] [lib/eeApp] window-all-closed quit');
      electronApp.quit(); 
    }
  })

  electronApp.on('before-quit', () => {
    setCloseAndQuit(true);
    app.callEvent(BeforeClose);
    cross.killAll();
  })

  app.callEvent(ElectronAppReady);
}

module.exports = {
  electronApp,
  createElectron,
};
