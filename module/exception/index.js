const Log = require('../log');

/**
 * 捕获异常
 */
exports.start = function() {
  process.on('uncaughtException', this.uncaughtExceptionHandler);
}

exports.uncaughtExceptionHandler = function(err) {
  if (!(err instanceof Error)) {
    err = new Error(String(err));
  }
 
  Log.coreLogger.error(err);
}