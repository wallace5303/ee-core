const path = require('path');
const EventEmitter = require('events');
const { fork } = require('child_process');
const serialize = require('serialize-javascript');
const Log = require('../../log');
const Ps = require('../../ps');
const Channel = require('../../const/channel');

class ForkProcess {
  constructor(host, opt = {}) {
    
    let cwd = Ps.getHomeDir();
    let appPath = path.join(__dirname, 'app.js');
    if (Ps.isPackaged()) {
      // todo fork的cwd目录为什么要在app.asar外 ？
      cwd = path.join(Ps.getHomeDir(), '..');
    }

    let options = Object.assign({
      processArgs: [],
      processOptions: { 
        cwd: cwd,
        env: Ps.allEnv(), 
        stdio: 'pipe' 
      }
    }, opt);

    this.emitter = new EventEmitter();
    this.host = host;
    this.args = options.processArgs;
    this.sleeping = false;

    // 传递给子进程的参数
    //this.args.push(JSON.stringify(options.params));

    this.child = fork(appPath, this.args, options.processOptions);
    this.pid = this.child.pid;
    this._init();
  }

  /**
   * 初始化事件监听
   */
  _init() {
    this.child.on('message', (m) => {
      Log.coreLogger.info(`[ee-core] [jobs/child] received a message from child-process, message: ${serialize(m)}`);
      if (m.channel == Channel.process.showException) {
        Log.coreLogger.error(`${m.data}`);
      }

      // 收到子进程消息，转发到 event 
      if (m.channel == Channel.process.sendToMain) {
        this._eventEmit(m);
      }
    });

    this.child.on('exit', (code, signal) => {
      let data = {
        pid: this.pid
      }
      this.host.emit(Channel.events.childProcessExit, data);
      Log.coreLogger.info(`[ee-core] [jobs/child] received a exit from child-process, code:${code}, signal:${signal}`);
    });

    this.child.on('error', (err) => {
      let data = {
        pid: this.pid
      }
      this.host.emit(Channel.events.childProcessError, data);
      Log.coreLogger.error(`[ee-core] [jobs/child] received a error from child-process, error: ${err} !`);
    });
  }

  /**
   * event emit
   */
  _eventEmit(m) {
    switch (m.eventReceiver) {
      case Channel.receiver.forkProcess:
        this.emitter.emit(m.event, m.data);
        break;
      case Channel.receiver.childJob:
        this.host.emit(m.event, m.data);
        break;    
      default:
        this.host.emit(m.event, m.data);
        this.emitter.emit(m.event, m.data);
        break;
    }
  }  
}

module.exports = ForkProcess;