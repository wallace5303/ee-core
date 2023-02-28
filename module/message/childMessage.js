const Log = require('../log');

/**
  * ChildMessage
  */
class ChildMessage {
  constructor() {
    // ...
  }

  /**
   * 初始化事件监听
   */
  initEvents() {
    process.on('disconnect', () => {
      Log.coreLogger.info(`[ee-core] [module/message/childMessage] child process disconnected:${process.pid} !`);
    });
    process.on('exit', () => {
      Log.coreLogger.info(`[ee-core] [module/message/childMessage] child process exited:${process.pid} !`);
    });
  }

  /**
   * 监听消息
   */
  onMessage(handle) {
    Log.coreLogger.info(`[ee-core] [module/message/childMessage] Received a message ${params} from the mainProcess`);

    process.on('message', handle.bind(this));
  }

  /**
   * 消息处理
   */
  // _handleMessage(params = {}) {
  //   Log.coreLogger.info(`[ee-core] [module/message/childMessage] Received a message ${params} from the mainProcess`);
  // }

  /**
   * 向主进程发消息
   */
  sendToMain(message, ...other) {
    return process.send(message, ...other);
  }

  /**
   * 断开连接
   */
  disconnect() {
    process.disconnect();
  }

  /**
   * 进程退出
   */
  exit() {
    process.exit();
  }
}



module.exports = ChildMessage;
