const debug = require('debug')('ee-core:logger');
const Loggers = require('egg-logger').EggLoggers;
const assert = require('assert');

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

    this.instance = new Logger(config);

    // 返回egg-logger实例
    return this.instance.eggLogger;
  }

  /**
   * 初始化模块
   */
  init(config) {
    const loggerConfig = config.logger;
    loggerConfig.type = 'application'; // application、agent

    if (config.env === 'prod' && loggerConfig.level === 'DEBUG' && !loggerConfig.allowDebugAtProd) {
      loggerConfig.level = 'INFO';
    }

    const loggers = new Loggers(config);

    loggers.coreLogger.info('[ee-core:logger] init all loggers with options: %j', loggerConfig);

    return loggers;
  };
}

module.exports = Logger;