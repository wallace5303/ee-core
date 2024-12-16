'use strict';

const debug = require('debug')('ee-core:config:config_loader');
const path = require('path');
const Ps = require('../ps');
const extend = require('../utils/extend');
const Timing = require('../core/lib/utils/timing');
const Loader= require('../loader');

class ConfigLoader {
  constructor() {
    this.timing = new Timing();
    this.config = {};
  }

  /**
   * Load config/config.xxx.js
   */
  load() {
    this.timing.start('Load Config');

    // Load Application config
    const appConfig = this._AppConfig();
    debug("[load] appConfig: %o", appConfig);
    this.config = appConfig;

    this.timing.end('Load Config');
    return this.config;
  }

  _AppConfig() {
    const names = [
      'config.default',
      `config.${Ps.env()}`,
    ];
    const target = {};
    for (const filename of names) {
      const config = this._loadConfig(Ps.getElectronDir(), filename);
      extend(true, target, config);
    }
    return target;
  }

  _loadConfig(dirpath, filename) {
    const appInfo = {
      name: Ps.appName(),
      baseDir: Ps.getElectronDir(),
      electronDir: Ps.getElectronDir(),
      env: Ps.env(),
      home: Ps.getHomeDir(),
      root: Ps.getRootDir(),
      appUserDataDir: Ps.getAppUserDataDir(),
      userHome: Ps.getUserHomeDir(),
      appVersion: Ps.appVersion(),
      isPackaged: Ps.isPackaged(),
      isEncrypted: Ps.isEncrypted(),
      execDir: Ps.getExecDir(),
    }
    const filepath = path.join(dirpath, 'config', filename);
    const config = Loader.loadOneFile(filepath, appInfo);
    debug("[_loadConfig] filepath: %s", filepath);
    if (!config) return null;

    return config;
  }
}

module.exports = {
  ConfigLoader
};