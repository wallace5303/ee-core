const Logger = require('./logger');
const EELoggers = Symbol('EeApplication#EELoggers');

const Log = {};

/**
 * 创建日志实例
 */
Log.create = function (config) {
  const eeLog = Logger.create(config);

  return eeLog;
};

/**
 * logger
 */
Log.logger = function () {
  if (!this[EELoggers]) {
    this[EELoggers] = Logger.create();
  }

  return this[EELoggers]['logger'] || null;
};

/**
 * coreLogger
 */
Log.coreLogger = function () {
  if (!this[EELoggers]) {
    this[EELoggers] = Logger.create();
  }

  return this[EELoggers]['coreLogger'] || null;
};

module.exports = Log;