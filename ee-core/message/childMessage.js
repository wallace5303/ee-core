const Channel = require('../const/channel');

class ChildMessage {
  constructor() {
    // ...
  }

  /**
   * 向主进程发消息 for ChildJob 实例
   */
  sendToMain(eventName, params = {}) {
    let receiver = Channel.receiver.childJob;
    return this.send(eventName, params, receiver);
  }

  /**
   * 向主进程发消息 for task 实例
   */
  send(eventName, params = {}, receiver) {
    let eventReceiver = receiver || Channel.receiver.forkProcess;
    let message = {
      channel: Channel.process.sendToMain,
      eventReceiver,
      event: eventName,
      data: params,
    }

    return process.send(message);
  }

  /**
   * 进程退出
   */
  exit(code = 0) {
    return process.exit(code);
  }

  /**
   * 发送错误到控制台
   */
  sendErrorToTerminal(err) {
    let errTips = (err && typeof err == 'object') ? err.toString() : '';
    let message = {
      channel: Channel.process.showException,
      data: errTips
    }
    process.send(message);
  }
}



module.exports = ChildMessage;
