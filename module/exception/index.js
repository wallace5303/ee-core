const Log = require('../log');

/**
 * 捕获异常
 */
exports.start = function() {
  this.uncaughtExceptionHandler();
  this.unhandledRejectionHandler();
}

/**
 * 当进程上抛出异常而没有被捕获时触发该事件，并且使异常静默。
 */
exports.uncaughtExceptionHandler = function() {
  process.on('uncaughtException', function(err) {
    if (!(err instanceof Error)) {
      err = new Error(String(err));
    }

    if (err.name === 'Error') {
      err.name = 'unhandledExceptionError';
    }

    Log.coreLogger.error(err);
  });
}

/**
 * 当进程上抛出异常而没有被捕获时触发该事件。
 */
exports.uncaughtExceptionMonitorHandler = function() {
  // process.on('uncaughtExceptionMonitor', function(err, origin) {
  //   if (!(err instanceof Error)) {
  //     err = new Error(String(err));
  //   }
   
  //   Log.coreLogger.error('uncaughtExceptionMonitor:',err);
  // });
}

/**
 * 当promise中reject的异常在同步任务中没有使用catch捕获就会触发该事件，
 * 即便是在异步情况下使用了catch也会触发该事件
 */
exports.unhandledRejectionHandler = function() {
  process.on('unhandledRejection', function(err) {
    if (!(err instanceof Error)) {
      const newError = new Error(String(err));
      // err maybe an object, try to copy the name, message and stack to the new error instance
      if (err) {
        if (err.name) newError.name = err.name;
        if (err.message) newError.message = err.message;
        if (err.stack) newError.stack = err.stack;
      }
      err = newError;
    }
    if (err.name === 'Error') {
      err.name = 'unhandledRejectionError';
    }

    Log.coreLogger.error(err);
  });
}