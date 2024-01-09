const EventEmitter = require('events');
const path = require('path');
const crossSpawn = require('cross-spawn');
const Log = require('../log');
const Ps = require('../ps');
const Channel = require('../const/channel');
const Helper = require('../utils/helper');
const UtilsPargv = require('../utils/pargv');
const EE = require('../ee');

class SpawnProcess {
  constructor(host, opt = {}) {
    this.emitter = new EventEmitter();
    this.host = host;
    this.child = undefined;
    this.pid = 0;
    this.name = "";
    this.config = {};
    this._init(opt);
  }


  /**
   * 初始化子进程
   */
  _init(options = {}) {
    const { cmdPath, cmdArgs, targetConf } = options;
    this.config = targetConf;
    this.name = this.config.name;

    // Launch executable program
    let standardOutput = ['ignore', 'ignore', 'ignore', 'ipc'];
    if (!Ps.isPackaged()) {
      standardOutput = ['inherit', 'inherit', 'inherit', 'ipc'];
    }
    let execDir = Ps.getExtraResourcesDir();
    if (this.config.hasOwnProperty('directory')) {
      execDir = path.join(process.cwd(), this.config.directory);
    }

    const coreProcess = crossSpawn(cmdPath, cmdArgs, { 
      stdio: standardOutput, 
      detached: false,
      cwd: execDir, 
      maxBuffer: 1024 * 1024 * 1024
    });
    this.child = coreProcess;
    this.pid = coreProcess.pid;

    coreProcess.on('exit', (code, signal) => {
      let data = {
        pid: this.pid
      }
      this.host.emitter.emit(Channel.events.childProcessExit, data);
      Log.coreLogger.info(`[ee-core] [corss/process] received a exit from child-process, code:${code}, signal:${signal}, pid:${this.pid}`);
      this._exitElectron();
    });

    coreProcess.on('error', (err) => {
      let data = {
        pid: this.pid
      }
      this.host.emitter.emit(Channel.events.childProcessError, data);
      Log.coreLogger.error(`[ee-core] [corss/process] received a error from child-process, error: ${err}, pid:${this.pid}`);
      this._exitElectron();
    });
  }

  /**
   * kill
   */
  kill(timeout = 1000) {
    console.log("----- spawnProcess kill ----  ");
    this.child.kill('SIGINT');
    setTimeout(() => {
      if (this.child.killed) return;
      this.child.kill('SIGKILL');
    }, timeout)
  }

  send(message) {
    return this.sendByType(message, 'message');
  }

  close() {
    return this.sendByType('close', 'close');
  }

  _generateId() {
    const rid = Helper.getRandomString();
    return `node:${this.pid}:${rid}`;
  }

  async sendByType(message, type) {
    const msg = typeof message === 'string' ? message : JSON.stringify(message);
    const id = this._generateId();

    this.child.send({
        id,
        type,
        data: msg,
    });
    return;
  }

  getArgsObj() {
    const obj = UtilsPargv(this.config.args);
    return obj;
  }

  /**
   * exit electron
   */
  _exitElectron(timeout = 1000) {
    const { CoreApp } = EE;
    if (this.config.appExit) {
      setTimeout(() => {
        // 进程退出前的一些清理工作
        CoreApp.appQuit();
      }, timeout)
    }
  }
}

module.exports = SpawnProcess;