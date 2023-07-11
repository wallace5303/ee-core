
const is = require('is-type-of');
const Exception = require('ee-core/exception');
const Loader = require('ee-core/loader');
const Log = require('ee-core/log');
const UtilsCore = require('ee-core/core/lib/utils');

// 开发环境下，ee-core是soft link
// /node_modules[\\/]electron[\\/]/.test(process.execPath)
// const Exception = require('../../exception');
// const Loader = require('../../loader');
// const Log = require('../../log');
// const UtilsCore = require('../../core/lib/utils');

Exception.start();
const commands = ['run'];

class ChildApp {
  constructor() {
    this._initEvents();
  }

  /**
   * 初始化事件监听
   */
  _initEvents() {
    process.on('message', this._handleMessage.bind(this));
    process.once('exit', (code) => {
      Log.coreLogger.info(`[ee-core] [jobs/child] received a exit from main-process, code:${code}, pid:${process.pid}`);
    });
  }

  /**
   * 监听消息
   */
  _handleMessage(m) {
    if (commands.indexOf(m.cmd) == -1) {
      return
    }
    switch (m.cmd) {
      case 'run':
        this.run(m);
        break;
      default:
    }
    Log.coreLogger.info(`[ee-core] [jobs/child] received a message from main-process, message: ${JSON.stringify(m)}`);
  }

  /**
   * 运行脚本
   */  
  run(msg = {}) {
    let filepath = msg.jobPath;
    let params = msg.jobParams;

    let mod = Loader.loadJsFile(filepath);
    if (is.class(mod) || UtilsCore.isBytecodeClass(mod)) {
      let jobClass = new mod(params);
      jobClass.handle();
    } else if (is.function(mod)) {
      mod(params);
    }
  }
}

new ChildApp();