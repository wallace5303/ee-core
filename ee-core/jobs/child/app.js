
const is = require('is-type-of');
const Exception = require('ee-core/exception');
const { loadJsFile } = require('ee-core/loader');
const { coreLogger } = require('ee-core/log');
const UtilsCore = require('ee-core/core/utils');

Exception.start();
const commands = ['run'];

class ChildApp {
  constructor() {
    this._initEvents();
    this.jobMap = new Map();
  }

  /**
   * 初始化事件监听
   */
  _initEvents() {
    process.on('message', this._handleMessage.bind(this));
    process.once('exit', (code) => {
      coreLogger.info(`[ee-core] [jobs/child] received a exit from main-process, code:${code}, pid:${process.pid}`);
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
    coreLogger.info(`[ee-core] [jobs/child] received a message from main-process, message: ${JSON.stringify(m)}`);
  }

  /**
   * 运行脚本
   */  
  run(msg = {}) {
    const {jobPath, jobParams, jobFunc, jobFuncParams} = msg;
    let mod = loadJsFile(jobPath);
    if (is.class(mod) || UtilsCore.isBytecodeClass(mod)) {
      if (!this.jobMap.has(jobPath)) {
        const instance = new mod(...jobParams);
        instance.handle(...jobParams);
        this.jobMap.set(jobPath, instance);
      } else {
        const instance = this.jobMap.get(jobPath);
        instance[jobFunc](...jobFuncParams);
      }

    } else if (is.function(mod)) {
      mod(jobParams);
    }
  }
}

new ChildApp();