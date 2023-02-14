const Loggers = require('egg-logger').EggLoggers;
const assert = require('assert');
const storage = require('../storage');

module.exports = {

  /**
   * 创建
   */
  create(config = {}) {
    if (Object.keys(config).length == 0) {
      const sysConfig = this._getCoreDB().getItem('config');
      config = Object.assign({}, {
        logger: sysConfig.logger,
        customLogger: sysConfig.customLogger || {}
      });
    }
    //console.log('log---------', config);

    assert(Object.keys(config).length != 0, `logger config is null`);

    const loggers = new Loggers(config);
    loggers.coreLogger.info('[ee-core:logger] init all loggers with options: %j', config);

    return loggers;
  },

  /**
   * 获取 coredb
   */
  _getCoreDB() {
    const coreDB = storage.connection('system');
    return coreDB;
  }
};