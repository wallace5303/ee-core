'use strict';

const is = require('electron-is');
const config = require('ee-core/config');
const shortcut = require('ee-core/lib/preferences/shortcut');
const tray = require('ee-core/lib/preferences/tray');
const awaken = require('ee-core/lib/preferences/awaken');
const security = require('ee-core/lib/preferences/security');
const chromeExtension = require('ee-core/lib/preferences/chromeExtension');

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
    const autoUpdater = require('ee-core/lib/preferences/autoUpdater');
    autoUpdater.checkUpdate();
  }
}
