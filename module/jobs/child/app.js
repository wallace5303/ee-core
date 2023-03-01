
const Exception = require('ee-core/module/exception');
Exception.start();
const Loader = require('ee-core/module/loader');
const Log = require('ee-core/module/log');

class ChildApp {
  constructor() {
    this._initEvents();
  }

  /**
   * 初始化事件监听
   */
  _initEvents() {
    process.on('disconnect', () => {
      Log.coreLogger.info(`[ee-core] [module/message/childMessage] child process disconnected:${process.pid} !`);
    });
    process.on('exit', () => {
      Log.coreLogger.info(`[ee-core] [module/message/childMessage] child process exited:${process.pid} !`);
    });
    process.on('message', this._handleMessage.bind(this));
  }

  /**
   * 监听消息
   */
  _handleMessage(message) {
    Log.coreLogger.info(`[ee-core] [module/message/childMessage] Received a message ${message} from the mainProcess`);

    this.run(message);
  }

  run(msg = {}) {
    Log.coreLogger.info('[ee-core] [child-process] run');

    Loader.loadJobFile(msg.jobPath, msg.params);
  }
}

new ChildApp();