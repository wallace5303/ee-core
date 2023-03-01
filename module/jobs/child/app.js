
// const Exception = require('../../exception');
// const Loader = require('../../loader');
// const Log = require('../../log');
// __dirname.indexOf("node_modules") == -1

// const Exception = require('ee-core/module/exception');
// const Loader = require('ee-core/module/loader');
// const Log = require('ee-core/module/log');

// const is = require('is-type-of');
// const UtilsCore = require('../../core/lib/utils');
Exception.start();

class ChildApp {
  constructor() {
    this._initEvents();
  }

  /**
   * 初始化事件监听
   */
  _initEvents() {
    process.on('message', this._handleMessage.bind(this));
    process.on('disconnect', () => {
      Log.coreLogger.info(`[ee-core] [message/childMessage] child process disconnected:${process.pid} !`);
    });
    process.on('exit', () => {
      Log.coreLogger.info(`[ee-core] [message/childMessage] child process exited:${process.pid} !`);
    });
  }

  /**
   * 监听消息
   */
  _handleMessage(message) {
    Log.coreLogger.info(`[ee-core] [message/childMessage] Received a message ${message} from the mainProcess`);

    this.run(message);
  }

  run(msg = {}) {
    Log.coreLogger.info('[ee-core] [child-process] run');

    const ret = Loader.loadJobFile(msg.jobPath, msg.params);
    // if (is.function(ret) && !is.class(ret) && !UtilsCore.isBytecodeClass(ret)) {
    //   ret = ret(...inject);
    // }
  }
}

new ChildApp();