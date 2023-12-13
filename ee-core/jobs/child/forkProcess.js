const path = require('path');
const EventEmitter = require('events');
const { fork } = require('child_process');
const serialize = require('serialize-javascript');
const Log = require('../../log');
const Ps = require('../../ps');
const Channel = require('../../const/channel');
const Helper = require('../../utils/helper');

class ForkProcess {
  constructor(host, opt = {}) {
    
    let cwd = Ps.getHomeDir();
    let appPath = path.join(__dirname, 'app.js');
    if (Ps.isPackaged()) {
      // todo fork的cwd目录为什么要在app.asar外 ？
      cwd = path.join(Ps.getHomeDir(), '..');
    }

    // TODO Object.assign 只能单层对象结构，多层的对象会直接覆盖
    let options = Object.assign({
      processArgs: {},
      processOptions: { 
        cwd: cwd,
        env: Ps.allEnv(), 
        stdio: 'ignore' // pipe
      }
    }, opt);

    this.emitter = new EventEmitter();
    this.host = host;
    this.args = [];
    this.sleeping = false;

    // 传递给子进程的参数
    this.args.push(JSON.stringify(options.processArgs));

    this.child = fork(appPath, this.args, options.processOptions);
    this.pid = this.child.pid;
    this._init();
  }

  /**
   * 初始化事件监听
   */
  _init() {
    const { messageLog } = this.host.config;
    this.child.on('message', (m) => {
      if (messageLog == true) {
        Log.coreLogger.info(`[ee-core] [jobs/child] received a message from child-process, message: ${serialize(m)}`);
      }
      
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
      Log.coreLogger.info(`[ee-core] [jobs/child] received a exit from child-process, code:${code}, signal:${signal}, pid:${this.pid}`);
    });

    this.child.on('error', (err) => {
      let data = {
        pid: this.pid
      }
      this.host.emit(Channel.events.childProcessError, data);
      Log.coreLogger.error(`[ee-core] [jobs/child] received a error from child-process, error: ${err}, pid:${this.pid}`);
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
  
  /**
   * 分发任务
   */
  dispatch(cmd, jobPath = '', params = {}) {
    // 消息对象
    const mid = Helper.getRandomString();
    let msg = {
      mid,
      cmd,
      jobPath,
      jobParams: params
    }

    // todo 是否会发生监听未完成时，接收不到消息？
    // 发消息到子进程
    this.child.send(msg);
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

  /**
   * sleep (仅Unix平台)
   */
  sleep() {
    if (this.sleeping) return;
    process.kill(this.pid, 'SIGSTOP');
    this.sleeping = true;
  }
  
  /**
   * wakeup (仅Unix平台)
   */
  wakeup() {
    if (!this.sleeping) return;
    process.kill(this.pid, 'SIGCONT');
    this.sleeping = false;
  }
}

module.exports = ForkProcess;