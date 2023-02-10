const {app} = require('electron');
const path = require('path');
const EeApp = require('./eeApp');
const debug = require('debug')('ee-core:Appliaction');
const fs = require('fs');

class Appliaction extends EeApp {
  constructor() {
    const { env } = process;
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
      //logsDir: app.getPath('logs'),
      appVersion: app.getVersion(),
      isPackaged: app.isPackaged,
      execDir: app.getAppPath()
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

    // Use encryption, base directory is public/electron
    const encryptDir = path.join(app.getAppPath(), 'public', 'electron');
    let isEncrypted = fs.existsSync(encryptDir);
    if (options.env == 'prod' && isEncrypted) {
      options.baseDir = encryptDir;
    }

    // normalize env
    env.NODE_ENV = options.env;
    env.EE_HOME = options.homeDir;
    env.EE_SERVER_ENV = options.env;
    env.EE_SERVER_SCOPE = options.serverScope;
    env.EE_USER_HOME = options.userHome;
    env.EE_APP_DATA = options.appData;
    env.EE_APP_USER_DATA = options.appUserData;
    env.EE_MAIN_PORT = null;
    env.EE_SOCKET_PORT = null;
    env.EE_HTTP_PORT = null;
    env.HOT_RELOAD = hotReload;
    env.EE_EXEC_DIR = options.execDir;
    env.EE_DATABASE_DIR = null;
    debug('options:%j', options)

    super(options);
    this.initialize();
  }

  async initialize () {

    await this.createPorts();

    await this.startSocket();

    await this.ready();

    await this.createElectronApp();

    await this.catchLog();
  } 
}

module.exports = Appliaction;