const logger = require('./logger');
const Log = {};

/**
 * 创建日志实例
 */
Log.create = function (config) {
  const eeLoggers = logger.getInstance(config);

  return eeLoggers;
};

module.exports = Log;