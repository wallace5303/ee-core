const Log = require('../log');
const Ps = require('../ps');
const Conf = require('../config');
const Message = require('../message');

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

    _devError(err);

    _exit();
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

    _devError(err);

    _exit();
  });
}

/**
 * 如果是子进程，发送错误到主进程控制台
 */
function _devError (err) {
  if (Ps.isForkedChild() && Ps.isDev()) {
    Message.childMessage.sendErrorToTerminal(err);
  }
}

/**
 * 捕获异常后是否退出
 */
function _exit () {
  let cfg = Conf.getValue('exception');
  if (!cfg) {
    return;
  }

  if (Ps.isMain() && cfg.mainExit == true) {
    _delayExit();
  } else if (Ps.isForkedChild() && cfg.childExit == true) {
    _delayExit();
  } else if (Ps.isRenderer() && cfg.rendererExit == true) {
    _delayExit();
  } else {
    // other
  }
}

/**
 * 捕获异常后是否退出
 */
function _delayExit() {
  // 等待日志等异步写入完成
  setTimeout(() => {
    process.exit();
  }, 1500)
}