const Exception = require('../exception');
const { app } = require('electron');
const path = require('path');
const debug = require('debug')('ee-core:Appliaction');
const EeApp = require('./eeApp');
const Utils = require('../utils');
const Ps = require('../ps');
const EE = require('./index');

class Appliaction extends EeApp {
  constructor() {
    Exception.start();
    const { env } = process;

    // initialize mode
    Ps.initMode();

    let options = {
      env: 'prod',
      serverScope: '',
      type: 'application',
      baseDir: path.join(app.getAppPath(), 'electron'),
      homeDir: app.getAppPath(),
      framework: path.join(app.getAppPath(), 'node_modules', 'ee-core'),
      appName: app.getName(),
      userHome: app.getPath('home'),
      appData: app.getPath('appData'),
      appUserData: app.getPath('userData'),
      appVersion: app.getVersion(),
      isPackaged: app.isPackaged,
      execDir: app.getAppPath(),
      isEncrypted: false
    }

    // argv
    let hotReload = false;
    for (let i = 0; i < process.argv.length; i++) {
      const tmpArgv = process.argv[i]
      if (tmpArgv.indexOf('--env=') !== -1) {
        options.env = tmpArgv.substring(6);
      }
      if (tmpArgv.indexOf('--hot-reload=') !== -1) {
        hotReload = tmpArgv.substring(13) == 1 ? true : false;
      }
    }

    // exec directory (exe dmg dep) for prod
    if (options.env == 'prod' && app.isPackaged) {
      options.execDir = path.dirname(app.getPath('exe'));
    }

    // Todo app.getAppPath() ??? process.cwd()
    // Use encryption, base directory is public/electron
    if (options.env == 'prod' && Utils.isEncrypt(app.getAppPath())) {
      options.baseDir = Ps.getEncryptDir(app.getAppPath());
      options.isEncrypted = true;
    }

    // normalize env
    env.EE_APP_NAME = options.appName;
    env.EE_HOME = options.homeDir;
    env.EE_BASE_DIR = options.baseDir;
    env.EE_SERVER_ENV = options.env;
    env.EE_SERVER_SCOPE = options.serverScope;
    env.EE_USER_HOME = options.userHome;
    env.EE_APP_DATA = options.appData;
    env.EE_APP_USER_DATA = options.appUserData;
    env.HOT_RELOAD = hotReload;
    env.EE_EXEC_DIR = options.execDir;
    env.EE_IS_PACKAGED = options.isPackaged;
    env.EE_IS_ENCRYPTED = options.isEncrypted;
    env.EE_DATABASE_DIR = null;
    env.EE_MAIN_PORT = null;
    env.EE_SOCKET_PORT = null;
    env.EE_HTTP_PORT = null;
    debug('options:%j', options)

    super(options);

    // 设置全局this
    EE.CoreApp = this;

    this.initialize();
  }

  async initialize () {

    await this.createPorts();

    await this.startSocket();
    
    await this.ready();

    await this.createElectronApp();

    await this.InitModuleMode();
  } 
}

module.exports = Appliaction;