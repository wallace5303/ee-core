const Storage = require('../storage');
const ConfigCache = require('./cache');
var SystemDb = undefined;

const Cfg = {

  /**
   * 获取 coredb
   */
  _getCoreDB() {
    // [todo] 要么每次new对象，要么所有地方都用同一个实例，否则会出现数据无法刷新的情况
    SystemDb = Storage.connection('system');
    return SystemDb;
  },

  /**
   * all
   */
  all(fromCache = true) {
    if (fromCache === true) {
      // 如果子进程
      const cacheValue = ConfigCache.all();
      return cacheValue;
    }
    const cdb = this._getCoreDB();
    const config = cdb.getItem('config');
  
    return config;
  },

  /**
   * setAll
   */
  setAll(value) {
    const cdb = this._getCoreDB();
    cdb.setItem('config', value);
  
    return;
  },

  /**
   * setValue
   */
  setValue(key, value) {
    const cdb = this._getCoreDB();
    cdb.setConfigItem(key, value);
  
    return;
  },

  /**
   * getValue
   */
  getValue(key, fromCache = true) {
    if (fromCache === true) {
      const cacheValue = ConfigCache.getValue(key);
      return cacheValue;
    }

    const cdb = this._getCoreDB();
    let v = cdb.getConfigItem(key);
  
    return v;
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