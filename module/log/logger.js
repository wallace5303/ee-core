const debug = require('debug')('ee-core:logger');
const Loggers = require('egg-logger').EggLoggers;
const assert = require('assert');
const storage = require('../../lib/storage');

class Logger {
  constructor (config) {
    debug('Loaded logger');

    assert(Object.keys(config).length != 0, `logger config is null`);
    this.eggLogger = this.init(config);
  }

  /**
   * 单例
   */
  static getInstance (config = {}) {
    if (typeof this.instance === 'object') {
      return this.instance.eggLogger;
    }

    if (Object.keys(config).length == 0) {
      const sysConfig = this._getCoreDB().getItem('config');
      config = Object.assign({}, {
        logger: sysConfig.logger,
        customLogger: sysConfig.customLogger || {}
      });
    }

    console.log('log---------', config);

    this.instance = new Logger(config);

    // 返回egg-logger实例
    return this.instance.eggLogger;
  }

  /**
   * 初始化模块
   */
  init(config) {
    const loggers = new Loggers(config);
    loggers.coreLogger.info('[ee-core:logger] init all loggers with options: %j', config);

    return loggers;
  }

  /**
   * 获取 coredb
   */
  _getCoreDB() {
    const coreDB = storage.connection('system');
    return coreDB;
  }
}

module.exports = Logger;