'use strict';

const debug = require('debug')('ee-core:app:boot');
const path = require('path');
//const Exception = require('../exception');
const { electronApp } = require('../electron/app');
const { isEncrypt } = require('../utils');
const { getArgumentByName, getEncryptDir } = require('../ps');
const { loadConfig } = require('../config');
const { loadLog } = require('../log');
const { loadController } = require('../controller');
const { loadApp } = require('./application');

class ElectronEgg {
  constructor() {

    //Exception.start();
    const baseDir = electronApp.getAppPath();
    const { env } = process;
    const environmet = getArgumentByName('env') || 'prod';

    const options = {
      env: environmet,
      baseDir,
      electronDir: path.join(baseDir, 'electron'),
      appName: electronApp.getName(),
      userHome: electronApp.getPath('home'),
      appData: electronApp.getPath('appData'),
      appUserData: electronApp.getPath('userData'),
      appVersion: electronApp.getVersion(),
      isPackaged: electronApp.isPackaged,
      execDir: baseDir,
      isEncrypted: false
    }

    // exec directory (exe dmg dep) for prod
    if (environmet == 'prod' && options.isPackaged) {
      options.execDir = path.dirname(electronApp.getPath('exe'));
    }

    if (environmet == 'prod' && isEncrypt(baseDir)) {
      options.electronDir = getEncryptDir(baseDir);
      options.isEncrypted = true;
    }

    // normalize env
    env.EE_ENV = environmet;
    env.EE_APP_NAME = options.appName;
    env.EE_APP_VERSION = options.appVersion;
    env.EE_BASE_DIR = options.baseDir;
    env.EE_ELECTRON_DIR = options.electronDir;
    env.EE_USER_HOME = options.userHome;
    env.EE_APP_DATA = options.appData;
    env.EE_APP_USER_DATA = options.appUserData;
    env.EE_EXEC_DIR = options.execDir;
    env.EE_IS_PACKAGED = options.isPackaged;
    env.EE_IS_ENCRYPTED = options.isEncrypted;
    env.EE_SOCKET_PORT = null;
    env.EE_HTTP_PORT = null;
    debug('[constructor] options:%j', options)
    this.init();
  }

  init() {
    loadConfig();
    loadLog();
    loadController();
    loadApp();
  }

  use() {


  }

  run() {
    
  }

}

module.exports = {
  ElectronEgg,

};