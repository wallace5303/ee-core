const {app, BrowserWindow} = require('electron');
const path = require('path');
const EeApp = require('./eeApp');
const debug = require('debug')('ee-core:Appliaction');

class Appliaction extends EeApp {
  constructor() {

    // 初始化环境变量
    // const opt = this.initEnv();
    const { env } = process;

    let options = {
      env: 'prod',
      serverScope: '',
      type: 'application',
      baseDir: path.join(app.getAppPath(), 'electron'),
      homeDir: process.cwd(),
      framework: path.join(process.cwd(), 'node_modules/ee-core'),
      appName: app.getName(),
      userHome: app.getPath('home'),
      appData: app.getPath('appData'),
      appUserData: app.getPath('userData'),
      logsDir: app.getPath('logs'),
      appVersion: app.getVersion()
    }

    // argv
    for (let i = 0; i < process.argv.length; i++) {
      const tmpArgv = process.argv[i]
      if (tmpArgv.indexOf('--env=') !== -1) {
        options.env = tmpArgv.substring(6)
      }
    }

    // normalize env

    env.NODE_ENV = 'production';
    env.EE_HOME = options.homeDir;
    env.EE_SERVER_ENV = options.env;
    env.EE_SERVER_SCOPE = options.serverScope;
    env.EE_USER_HOME = options.userHome;
    env.EE_APP_DATA = options.appData;
    env.EE_APP_USER_DATA = options.appUserData;
    env.EE_EGG_PORT = null;
    env.EE_IPC_PORT = null;
    debug('options:%j', options)

    super(options);

    this.initialize();
  }

  initEnv () {
    const { env } = process;

    let options = {
      env: 'prod',
      serverScope: '',
      type: 'application',
      baseDir: path.join(app.getAppPath(), 'electron'),
      homeDir: process.cwd(),
      framework: path.join(process.cwd(), 'node_modules/ee-core'),
      appName: app.getName(),
      userHome: app.getPath('home'),
      appData: app.getPath('appData'),
      appUserData: app.getPath('userData'),
      logsDir: app.getPath('logs'),
      appVersion: app.getVersion()
    }

    // argv
    for (let i = 0; i < process.argv.length; i++) {
      const tmpArgv = process.argv[i]
      if (tmpArgv.indexOf('--env=') !== -1) {
        options.env = tmpArgv.substring(6)
      }
    }

    // normalize env

    env.NODE_ENV = 'production';
    env.EE_HOME = options.homeDir;
    env.EE_SERVER_ENV = options.env;
    env.EE_SERVER_SCOPE = options.serverScope;
    env.EE_USER_HOME = options.userHome;
    env.EE_APP_DATA = options.appData;
    env.EE_APP_USER_DATA = options.appUserData;
    env.EE_EGG_PORT = null;
    env.EE_IPC_PORT = null;
    debug('options:%j', options)

    return options;
  }

  async initialize () {
    const self = this;
    // 限制一个窗口
    this.limitOneWindow();

    app.on('second-instance', (event) => {
      if (self.mainWindow) {
        if (self.mainWindow.isMinimized()) {
          self.mainWindow.restore();
        }
        self.mainWindow.focus()
      }
    })
  
    app.whenReady().then(() => {
      self.createWindow();
      app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) {
          self.createWindow();
        }
      })
    })
    
    app.on('window-all-closed', function () {
      if (process.platform !== 'darwin') {
        self.coreLogger.info('[Appliaction] [initialize] window-all-closed quit');
        self.appQuit();
      }
    })
  }  
}

/**
 * Catch exception
 */
// process.on('uncaughtException', function(err) {
//   Appliaction.coreLogger.error(err);
// });

module.exports = Appliaction;