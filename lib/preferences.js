'use strict';

const is = require('electron-is');
const config = require('ee-core/config');
const shortcut = require('ee-core/preferences/shortcut');
const tray = require('ee-core/preferences/tray');
const awaken = require('ee-core/preferences/awaken');
const security = require('ee-core/preferences/security');
const chromeExtension = require('ee-core/preferences/chromeExtension');

module.exports = async () => {
  // shortcut
  shortcut.setup();

  // tray
  tray.setup();

  // awaken 
  awaken.setup();

  // security 
  security.setup();

  // chrome extension
  await chromeExtension.setup();

  // check update
  const updateConfig = config.get('autoUpdate');
  if ((is.windows() && updateConfig.windows) || (is.macOS() && updateConfig.macOS)
    || (is.linux() && updateConfig.linux)) {
    const autoUpdater = require('ee-core/preferences/autoUpdater');
    autoUpdater.checkUpdate();
  }
}
