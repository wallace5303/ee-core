const EE = require('../ee');
const { ConfigLoader } = require('./config_loader');

const Instance = {
  config: null,
};

const conf = {

  loadConfig() {
    const configLoader = new ConfigLoader();
    Instance["config"] = configLoader.load();
    return Instance["config"];
  },

  /**
   * 获取 内存中的config
   */
  _getConfig() {
    const { CoreApp } = EE;

    if (CoreApp && CoreApp.config) {
      return CoreApp.config;
    }

    if (Instance["config"]) {
      return Instance["config"];
    }

    // 重新加载 config
    this.loadConfig();

    if (!Instance["config"]) {
      throw new Error('[ee-core] [config] config is not loaded!');
    }

    return Instance["config"];
  },

  /**
   * all
   */
  all() {
    return this._getConfig();
  },

  /**
   * getValue
   */
  getValue(key) {
    const v = this._objectGet(this._getConfig(), key);
    return v;
  }, 
  
  _objectGet(object, path, defaultValue) {
    const pathParts = Array.isArray(path) ? path : path.split('.');
    const value = pathParts.reduce((obj, key) => obj && key in obj ? obj[key] : undefined, object);
    return value === undefined ? defaultValue : value;
  }
};

module.exports = conf;