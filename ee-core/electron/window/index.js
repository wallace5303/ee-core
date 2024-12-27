'use strict';

const debug = require('debug')('ee-core:electron:window');
const is = require('is-type-of');
const path = require('path');
const axios = require('axios');
const { BrowserWindow } = require('electron');
const { getConfig } = require('../../config');
const { getApp, WindowReady } = require('../../app/application');
const { env, isDev, getBaseDir } = require('../../ps');
const { loadFile } = require('../../loader');
const { isFileProtocol } = require('../../utils');
const { getHtmlFilepath } = require('../../html');
const { fileIsExist, sleep } = require('../../utils/helper');
const { coreLogger } = require('../../log');

const Instance = {
  mainWindow: null,
  closeAndQuit: true,
};

// getMainWindow
function getMainWindow() {
  return Instance.mainWindow;
}

// Create the main application window
function createMainWindow() {
  const { openDevTools, windowsOption } = getConfig();
  const win = new BrowserWindow(windowsOption);
  Instance.mainWindow = win;

  // DevTools
  if (is.object(openDevTools)) {
    win.webContents.openDevTools(openDevTools);
  } else if (openDevTools === true) {
    win.webContents.openDevTools({
      mode: 'undocked'
    });
  }
  
  const app = getApp();
  app.callEvent(WindowReady);
  return win;
}

// restored window
function restoreMainWindow() {
  if (Instance.mainWindow) {
    if (Instance.mainWindow.isMinimized()) {
      Instance.mainWindow.restore();
    }
    Instance.mainWindow.show();
    Instance.mainWindow.focus();
  }
}

// Set the flag for exiting after close all windows
function setCloseAndQuit(flag) {
  Instance.closeAndQuit = flag;
}

function getCloseAndQuit() {
  return Instance.closeAndQuit;
}

// load server 
// type: remote | single
async function loadServer() {
  let type = 'spa';
  let url = '';
  const { remote, mainServer } = getConfig();
  const win = getMainWindow();

  // remote model
  if (remote.enable == true) {
    type = 'remote';
    url = remote.url;
    loadMainUrl(type, url);
    return;
  }

  // 开发环境
  if (isDev()) {
    let url;
    let load = 'url';

    const binFile = path.join(getBaseDir(), "./cmd/bin.js");
    const binConfig = loadFile(binFile);
    const { dev } = binConfig;
    const frontendConf = dev.frontend;
    const electronConf = dev.electron;

    url = frontendConf.protocol + frontendConf.hostname + ':' + frontendConf.port;
    if (isFileProtocol(frontendConf.protocol)) {
      url = path.join(getBaseDir(), frontendConf.directory, frontendConf.indexPath);
      load = 'file';
    }

    // Check if UI serve is started, load a boot page first
    if (load == 'url') {
      // loading page
      let lp = getHtmlFilepath('boot.html');
      if (electronConf.hasOwnProperty('loadingPage') && electronConf.loadingPage != '') {
        lp = path.join(getBaseDir(), electronConf.loadingPage);
      }
      _loadingPage(lp);

      // check frontend is ready
      const retryTimes = frontendConf.force === true ? 3 : 60;
      let count = 0;
      let frontendReady = false;
      while(!frontendReady && count < retryTimes){
        await sleep(1 * 1000);
        try {
          await axios({
            method: 'get',
            url,
            timeout: 1000,
            proxy: false,
            headers: { 
              'Accept': 'text/html, application/json, text/plain, */*',
            },
            responseType: 'text',
          });
          frontendReady = true;
        } catch(err) {
          // console.log('The frontend service is starting');
          // console.warn(err.stack)
        }
        count++;
      }

      if (frontendReady == false && frontendConf.force !== true) {
        const bootFailurePage = getHtmlFilepath('failure.html');
        win.loadFile(bootFailurePage);
        coreLogger.error(`[ee-core] Please check the ${url} !`);
        return;
      }
    }

    loadMainUrl(type, url, load);
    return;
  }

  // 生产环境
  // cross service takeover web
  if (mainServer.hasOwnProperty('takeover')) {
    // [todo] 
    //await this._crossTakeover(mainServer)
    return
  }

  // 主进程
  url = path.join(getBaseDir(), mainServer.indexPath);
  loadMainUrl(type, url, 'file');
}

/**
 * 主服务
 * @params load <string> value: "url" 、 "file"
 */
function loadMainUrl(type, url, load = 'url') {
  const { mainServer } = getConfig();
  const mainWindow = getMainWindow();
  coreLogger.info('[ee-core] Env: %s, Type: %s', env(), type);
  coreLogger.info('[ee-core] App running at: %s', url);
  if (load ==  'file')  {
    mainWindow.loadFile(url, mainServer.options)
    .then()
    .catch((err)=>{
      coreLogger.error(`[ee-core] Please check the ${url} !`);
    });
  } else {
    mainWindow.loadURL(url, mainServer.options)
    .then()
    .catch((err)=>{
      coreLogger.error(`[ee-core] Please check the ${url} !`);
    });
  }
}

// loading page 
function _loadingPage(name) {
  if (!fileIsExist(name)) {
    return
  }
  const win = getMainWindow();
  win.loadFile(name);
}

module.exports = {
  getMainWindow,
  createMainWindow,
  restoreMainWindow,
  setCloseAndQuit,
  getCloseAndQuit,
  loadServer
};