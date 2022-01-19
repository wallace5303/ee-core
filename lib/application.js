const { app } = require('electron');
const path = require('path');
const EeApp = require('./eeApp');

class Appliaction extends EeApp {
  constructor() {
    const { env } = process;

    let options = {
      env: 'prod',
      baseDir: process.cwd(),
      electronDir: path.join(process.cwd(), 'electron'),
      framework: path.join(process.cwd(), 'node_modules/egg'),
      test_base_dir: app.getAppPath(),
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
    env.HOME = options.baseDir;
    env.EE_SERVER_ENV = options.env;
    env.EE_USER_HOME = options.userHome;
    env.EE_APP_DATA = options.appData;
    env.EE_APP_USER_DATA = options.appUserData;
    
    super(options);
    this.console.debug(options);
  }
}

module.exports = Appliaction;