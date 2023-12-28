const EventEmitter = require('events');
const crossSpawn = require('cross-spawn');
const serialize = require('serialize-javascript');
const { app: electronApp } = require('electron');
const Log = require('../log');
const Ps = require('../ps');
const Channel = require('../const/channel');
const Conf = require('../config/cache');

class SpawnProcess {
  constructor(host, opt = {}) {
    this.emitter = new EventEmitter();
    this.host = host;
    this.child = undefined;
    this.pid = 0;
    this._init(opt);
  }


  /**
   * 初始化子进程
   */
  _init(options = {}) {
    const { cmdName, cmdPath, cmdArgs, conf } = options;
    // Launch executable program
    let standardOutput = ['ignore', 'ignore', 'ignore', 'ipc'];
    if (!Ps.isPackaged()) {
      standardOutput = ['inherit', 'inherit', 'inherit', 'ipc'];
    }

    const coreProcess = crossSpawn(cmdPath, cmdArgs, { stdio: standardOutput, detached: false });
    this.child = coreProcess;
    coreProcess.on('close', (code, signal) => {
      Log.coreLogger.info(`[ee-core] [cross/process] [pid=${coreProcess.pid}, exited with code: ${code}, signal: ${signal}`);
      if (0 !== code) {
        // 弹错误窗口
        Log.coreLogger.error(`[ee-core] [cross/process] Please check [${cmdName}] service log !!!`);
      }

      // electron quit
      if (conf.appExit) {
        setTimeout(() => {
          // 进程退出前的一些清理工作
          electronApp.quit();
        }, 1000)
      }
    });

    coreProcess.on('message', (m) => {
      Log.coreLogger.info(`[ee-core] [corss/process] received a message from child-process, message: ${serialize(m)}`);
      
      // 先注释，如果是开发环境，inherit 应该可以直接显示
      // if (m.channel == Channel.process.showException) {
      //   Log.coreLogger.error(`${m.data}`);
      // }

      // 收到子进程消息，转发到 event 
      this.emitter.emit(m.event, m.data);
    });

    coreProcess.on('exit', (code, signal) => {
      let data = {
        pid: this.pid
      }
      this.host.emit(Channel.events.childProcessExit, data);
      Log.coreLogger.info(`[ee-core] [corss/process] received a exit from child-process, code:${code}, signal:${signal}, pid:${this.pid}`);
    });

    coreProcess.on('error', (err) => {
      let data = {
        pid: this.pid
      }
      this.host.emit(Channel.events.childProcessError, data);
      Log.coreLogger.error(`[ee-core] [corss/process] received a error from child-process, error: ${err}, pid:${this.pid}`);
    });
  }

  /**
   * kill
   */
  kill(timeout = 1000) {
    this.child.kill('SIGINT');
    setTimeout(() => {
      if (this.child.killed) return;
      this.child.kill('SIGKILL');
    }, timeout)
  }

}

module.exports = SpawnProcess;