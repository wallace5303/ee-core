'use strict';

//const Exception = require('../exception');
const { app } = require('electron');
const path = require('path');
const debug = require('debug')('ee-core:app:Appliaction');
const Utils = require('../utils');
const Ps = require('../ps');
const { loadConfig } = require('../config');
const { loadLog } = require('../log');

class Appliaction {
  constructor() {
    //Exception.start();
    const baseDir = app.getAppPath();
    const { env } = process;

    const options = {
      env: 'prod',
      baseDir,
      electronDir: path.join(baseDir, 'electron'),
      appName: app.getName(),
      userHome: app.getPath('home'),
      appData: app.getPath('appData'),
      appUserData: app.getPath('userData'),
      appVersion: app.getVersion(),
      isPackaged: app.isPackaged,
      execDir: baseDir,
      isEncrypted: false
    }

    // argv
    for (let i = 0; i < process.argv.length; i++) {
      const tmpArgv = process.argv[i]
      if (tmpArgv.indexOf('--env=') !== -1) {
        options.env = tmpArgv.substring(6);
      }
    }

    // exec directory (exe dmg dep) for prod
    if (options.env == 'prod' && app.isPackaged) {
      options.execDir = path.dirname(app.getPath('exe'));
    }

    // Todo app.getAppPath() ??? process.cwd()
    // Use encryption, base directory is public/electron
    if (options.env == 'prod' && Utils.isEncrypt(baseDir)) {
      options.electronDir = Ps.getEncryptDir(baseDir);
      options.isEncrypted = true;
    }

    // normalize env
    env.EE_ENV = options.env;
    env.EE_APP_NAME = options.appName;
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

    this.initialize();
  }

  async initialize () {
    loadConfig();
    loadLog();


    // await this.createPorts();

    // await this.startSocket();
    
    // await this.ready();

    // await this.createElectronApp();

  } 
}

module.exports = {
  Appliaction
};