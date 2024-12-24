'use strict';

const { Receiver, Processes } = require('../const/channel');

class ChildMessage {

  /**
   * 向主进程发消息 for ChildJob 实例
   */
  sendToMain(eventName, params = {}) {
    let receiver = Receiver.childJob;
    return this.send(eventName, params, receiver);
  }

  /**
   * 向主进程发消息 for task 实例
   */
  send(eventName, params = {}, receiver) {
    let eventReceiver = receiver || Receiver.forkProcess;
    let message = {
      channel: Processes.sendToMain,
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
    errTips += ' Error !!! Please See file ee-core.log or ee-error-xxx.log for details !'
    let message = {
      channel: Processes.showException,
      data: errTips
    }
    process.send(message);
  }
}



module.exports = { 
  ChildMessage
};
