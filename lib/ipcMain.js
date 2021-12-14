const { ipcMain: ipc } = require('electron')
const path = require('path')
const fs = require('fs')
const _ = require('lodash');

class IpcMain {
  constructor () {}

  /**
   * 单例
   */
  static getInstance () {
    if (typeof this.instance === 'object') {
      return this.instance;
    }
    this.instance = new IpcMain();
    return this.instance;
  }

  /**
   * 初始化模块 - 加载所有的主程序
   */
  init () {
    console.log('[ee-core] [lib-ipc] [init]');
    const self = this;
    const ipcDir = path.normalize(__dirname + '/../ipc');
    fs.readdirSync(ipcDir).forEach(function (filename) {
      if (path.extname(filename) === '.js' && filename !== 'index.js') {
        const name = path.basename(filename, '.js');
        const fileObj = require(`../ipc/${filename}`);
        _.map(fileObj, function(fn, method) {
          let methodName = self.getApiName(name, method);
          self.answerRenderer(methodName, fn);
        });
      }
    })
  }

  /**
   * 发送响应信息给渲染进程
   * @param event
   * @param channel
   * @param data
   * @private
   */
  _echo (event, channel, data) {
    console.log('[ee-core] [ipc] [answerRenderer] result: ', {channel, data})
    event.reply(`${channel}`, data)
  }

  /**
   * 执行主进程函数,并响应渲染进程
   * @param channel
   * @param callback
   */
  answerRenderer (channel, callback) {
    const self = this;
    ipc.on(channel, async (event, param) => {
      const result = await callback(event, channel, param)
      self._echo(event, channel, result)
    })
  }


  /**
   * get api method name
   * ex.) jsname='user' method='get' => 'user.get'
   * @param {String} jsname
   * @param {String} method
   */
  getApiName (jsname, method) {
    return jsname + '.' + method;
  }
}

module.exports = IpcMain;
