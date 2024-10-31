import Log from "../log/index.js";
import * as Ps from "../ps/index.js";
import Conf from "../config/cache.js";
import Message from "../message/index.js";
/**
 * 如果是子进程，发送错误到主进程控制台
 */
function _devError(err) {
    if (Ps.isForkedChild() && Ps.isDev()) {
        Message.childMessage.sendErrorToTerminal(err);
    }
}
/**
 * 捕获异常后是否退出
 */
function _exit() {
    let cfg = Conf.getValue('exception');
    if (!cfg) {
        return;
    }
    if (Ps.isMain() && cfg.mainExit == true) {
        _delayExit();
    }
    else if (Ps.isForkedChild() && cfg.childExit == true) {
        _delayExit();
    }
    else if (Ps.isRenderer() && cfg.rendererExit == true) {
        _delayExit();
    }
    else {
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
    }, 1500);
}
export const start = function () {
    this.uncaughtExceptionHandler();
    this.unhandledRejectionHandler();
};
export const uncaughtExceptionHandler = function () {
    process.on('uncaughtException', function (err) {
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
};
export const uncaughtExceptionMonitorHandler = function () {
    // process.on('uncaughtExceptionMonitor', function(err, origin) {
    //   if (!(err instanceof Error)) {
    //     err = new Error(String(err));
    //   }
    //   Log.coreLogger.error('uncaughtExceptionMonitor:',err);
    // });
};
export const unhandledRejectionHandler = function () {
    process.on('unhandledRejection', function (err) {
        if (!(err instanceof Error)) {
            const newError = new Error(String(err));
            // err maybe an object, try to copy the name, message and stack to the new error instance
            if (err) {
                if (err.name)
                    newError.name = err.name;
                if (err.message)
                    newError.message = err.message;
                if (err.stack)
                    newError.stack = err.stack;
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
};
