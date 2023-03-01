
const is = require('is-type-of');
let Exception;
let Loader;
let Log;
let UtilsCore;

if (__dirname.indexOf("node_modules") == -1) {
  Exception = require('../../exception');
  Loader = require('../../loader');
  Log = require('../../log');
  UtilsCore = require('../../core/lib/utils');
}

// const Exception = require('ee-core/module/exception');
// const Loader = require('ee-core/module/loader');
// const Log = require('ee-core/module/log');
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
    this.run(message);
    Log.coreLogger.info(`[ee-core] [message/childMessage] Received a message ${JSON.stringify(message)} from the mainProcess`);
  }

  /**
   * 运行脚本
   */  
  run(msg = {}) {
    let filepath = msg.jobPath;
    let params = msg.params;

    let mod = Loader.loadJsFile(filepath);
    if (is.class(mod) || UtilsCore.isBytecodeClass(mod)) {
      Log.coreLogger.info('[ee-core] [child-process] is class');
      let jobClass = new mod(params);
      jobClass.handle();
    } else if (is.function(mod)) {
      Log.coreLogger.info('[ee-core] [child-process] is function');
      mod(params);
    }

    Log.coreLogger.info('[ee-core] [child-process] job run');
  }
}

new ChildApp();