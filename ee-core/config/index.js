const ConfigCache = require('./cache');

const Cfg = {

  /**
   * all
   */
  all() {
    const cacheValue = ConfigCache.all();
    return cacheValue;
  },

  /**
   * getValue
   */
  getValue(key) {
    const cacheValue = ConfigCache.getValue(key);
    return cacheValue;
  },  

  /**
   * isFileProtocol
   */
  isFileProtocol(config) {
    if (config.protocol == 'file://') {
      return true;
    }
    return false;
  },

  /**
   * isWebProtocol
   */
  isWebProtocol(config) {
    if (['http://', 'https://'].includes(config.protocol)) {
      return true;
    }
    return false;
  },   
};

module.exports = Cfg;