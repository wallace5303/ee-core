const Channel = require('../const/channel');

class ChildMessage {
  constructor() {
    // ...
  }

  /**
   * 向主进程发消息
   */
  sendToMain(eventName, params = {}) {
    let message = {
      channel: Channel.process.sendToMain,
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
}



module.exports = ChildMessage;
