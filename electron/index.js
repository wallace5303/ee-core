const {app, BrowserWindow, Menu, protocol} = require('electron');
const Logger = require('./logger');
const MainWindow = require('./mainWindow');

const Electron = {

  /**
   * extra
   */
  extra: {
    closeWindow: false,
  },

  /**
   * logger
   */
  get mainWindow() {
    return MainWindow;
  },


};

module.exports = Electron;