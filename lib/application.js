const {app} = require('electron');
const path = require('path');
const EeApp = require('./eeApp');
const debug = require('debug')('ee-core:Appliaction');

class Appliaction extends EeApp {
  constructor() {

    // 初始化环境变量
    // const opt = this.initEnv();
    const { env } = process;

    // 路径不能使用绝对，打包前后有问题
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

    // normalize env
    env.NODE_ENV = 'production';
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
    debug('options:%j', options)

    super(options);
    this.initialize();
  }

  async initialize () {

    await this.createPorts();

    this.startSocket();
    //return;

    await this.ready();

    await this.createElectronApp();

    await this.catchLog();
  } 
}

module.exports = Appliaction;