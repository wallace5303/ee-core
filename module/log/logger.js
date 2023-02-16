const Loggers = require('egg-logger').EggLoggers;
const assert = require('assert');
const Storage = require('../storage');

module.exports = {

  /**
   * 创建
   */
  create(config = {}) {
    let opt = {};
    
    if (Object.keys(config).length == 0) {
      const sysConfig = this._getCoreDB().getItem('config');
      opt = Object.assign({}, {
        logger: sysConfig.logger,
        customLogger: sysConfig.customLogger || {}
      });
    } else {
      opt.logger = config.logger;
      opt.customLogger = config.customLogger;
    }
    //console.log('log---------', config);

    assert(Object.keys(opt).length != 0, `logger config is null`);

    const loggers = new Loggers(opt);

    return loggers;
  },

  /**
   * 获取 coredb
   */
  _getCoreDB() {
    const coreDB = Storage.connection('system');
    return coreDB;
  }
};