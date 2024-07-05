const EE = require('../ee');

const conf = {

  /**
   * 获取 内存中的config
   */
  _getConfig(withError = true) {
    const { CoreApp } = EE;
    if (!CoreApp && withError) {
      throw new Error(`[ee-core] [config] Frame initialization is not complete !`);
    }
    if (!CoreApp) {
      return null;
    }

    return CoreApp.config;
  },

  /**
   * all
   */
  all(withError = true) {
    return this._getConfig(withError);
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