'use strict';

const debug = require('debug')('ee-core:app:boot');
const path = require('path');
const { loadException } = require('../exception');
const { electronApp } = require('../electron/app');
const { getArgumentByName, getBundleDir } = require('../ps');
const { loadConfig } = require('../config');
const { loadLog } = require('../log');
const { loadController } = require('../controller');
const { loadEventBus, getEventBus, Ready } = require('./events');
const { loadApp } = require('./application');
const { loadDir } = require('./dir');
const { loadSocket } = require('../socket');
const { loadElectron } = require('../electron');

class ElectronEgg {
  constructor() {
    const baseDir = electronApp.getAppPath();
    const { env } = process;
    const entryFile = process.argv[1];
    const environmet = getArgumentByName('env') || 'prod';

    const options = {
      env: environmet,
      baseDir,
      electronDir: getBundleDir(baseDir),
      appName: electronApp.getName(),
      userHome: electronApp.getPath('home'),
      appData: electronApp.getPath('appData'),
      appUserData: electronApp.getPath('userData'),
      appVersion: electronApp.getVersion(),
      isPackaged: electronApp.isPackaged,
      execDir: baseDir,
    }

    // exec directory (exe dmg dep) for prod
    if (environmet == 'prod' && options.isPackaged) {
      options.execDir = path.dirname(electronApp.getPath('exe'));
    }

    // 开发环境可以指定 electron 入口文件
    if (environmet !== 'prod' && ['.', './'].entryFile.indexOf(entryFile) !== -1) {
      options.electronDir = path.join(baseDir, entryFile);
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
    env.EE_SOCKET_PORT = null;
    env.EE_HTTP_PORT = null;
    debug('[constructor] options:%j', options)

    this.init();
  }

  init() {
    // basic functions
    loadException();
    loadConfig();
    loadDir();
    loadLog();
    loadEventBus();
    loadApp();
  }

  register(eventName, handler) {
    const eventBus = getEventBus();
    return eventBus.register(eventName, handler);
  }

  run() {
    // extended functions
    const eventBus = getEventBus();
    loadController();
    loadSocket();
    eventBus.emitLifecycle(Ready);
    loadElectron();
  }
}

module.exports = {
  ElectronEgg,
};