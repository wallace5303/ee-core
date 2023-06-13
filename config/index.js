const Storage = require('../storage');

const Cfg = {

  /**
   * 获取 coredb
   */
  _getCoreDB() {
    const coreDB = Storage.connection('system');
    return coreDB;
  },

  /**
   * all
   */
  all() {
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
  getValue(key) {
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