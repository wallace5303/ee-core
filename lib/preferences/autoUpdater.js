'use strict';

const updater = require("electron-updater");
const AU = updater.autoUpdater;
const config = require('ee-core/lib/config');
const {app} = require('electron');
const eLogger = require('ee-core/lib/eLogger').get();
const helper = require('ee-core/lib/helper');

class AutoUpdater {
  constructor () {}

  /**
   * 单例
   */
  static getInstance () {
    if (typeof this.instance === 'object') {
      return this.instance;
    }
    this.instance = new AutoUpdater();
    return this.instance;
  }

  /**
   * 初始化模块
   */
  init () {
    console.log('[ee-core] [lib-preference-autoUpater] [init]');
    const version = app.getVersion();
    eLogger.info('[autoUpdater] [init] current version: ', version);
    const platformObj = helper.getPlatform();
  
    const updateConfig = config.get('autoUpdate');
    let server = updateConfig.options.url;
    server = `${server}${platformObj.platform}/`;
    eLogger.info('[autoUpdater] [init] server: ', server);
    updateConfig.options.url = server;
  
    try {
      AU.setFeedURL(updateConfig.options);
    } catch (error) {
      eLogger.error('[autoUpdater] [init] setFeedURL error : ', error);
    }
  
    AU.on('checking-for-update', () => {
      sendStatusToWindow('Checking for update...');
    })
    AU.on('update-available', (info) => {
      sendStatusToWindow('Update available.');
    })
    AU.on('update-not-available', (info) => {
      sendStatusToWindow('Update not available.');
    })
    AU.on('error', (err) => {
      sendStatusToWindow('Error in auto-updater. ' + err);
    })
    AU.on('download-progress', (progressObj) => {
      let log_message = "Download speed: " + progressObj.bytesPerSecond;
      log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
      log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
      sendStatusToWindow(log_message);
    })
    AU.on('update-downloaded', (info) => {
      sendStatusToWindow('Update downloaded');
      // quit and update
      helper.appQuit();
      AU.quitAndInstall();
    });
  }

  checkUpdate () {
    AU.checkForUpdatesAndNotify();
  }


  sendStatusToWindow (text) {
    eLogger.info(text);
    MAIN_WINDOW.webContents.send('message', text);
  }
}  

module.exports = AutoUpdater;