const Logger = require('./logger');
const EELoggers = Symbol('EeApplication#EELoggers');

const Log = {};

/**
 * 创建日志实例
 */
Log.create = function (config) {
  const eeLoggers = new Logger(config);

  return eeLoggers;
};

/**
 * logger
 */
Log.logger = function () {
  if (!this[EELoggers]) {
    this[EELoggers] = new Logger();
  }

  return this[EELoggers]['logger'] || null;
};

/**
 * coreLogger
 */
Log.coreLogger = function () {
  if (!this[EELoggers]) {
    this[EELoggers] = new Logger();
  }

  return this[EELoggers]['coreLogger'] || null;
};

module.exports = Log;