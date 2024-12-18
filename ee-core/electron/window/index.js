'use strict';

const is = require('is-type-of');
const { BrowserWindow } = require('electron');
const { getConfig } = require('../../config');

const Instance = {
  mainWindow: null,
  closeAndQuit: false,
};

// getMainWindow
function getMainWindow() {
  if (!Instance.mainWindow) {
    Instance.mainWindow = createMainWindow();
  }

  return Instance.mainWindow;
}

// Create the main application window
function createMainWindow() {
  const config = getConfig();
  const win = new BrowserWindow(config.windowsOption);
  Instance.mainWindow = win;

  // DevTools
  if (is.object(config.openDevTools)) {
    win.webContents.openDevTools(config.openDevTools);
  } else if (config.openDevTools === true) {
    win.webContents.openDevTools({
      mode: 'undocked'
    });
  } else {
    //
  }
  
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

module.exports = {
  getMainWindow,
  createMainWindow,
  restoreMainWindow,
  setCloseAndQuit,
  getCloseAndQuit
};