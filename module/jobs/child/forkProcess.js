const path = require('path');
const { fork } = require('child_process');
const serialize = require('serialize-javascript');
const Log = require('../../log');
const Ps = require('../../utils/ps');
const Channel = require('../../const/channel');

class ForkProcess {
  constructor(host, opt = {}) {
    
    let options = Object.assign({
      processOptions: { 
        cwd: Ps.getHomeDir(),
        env: Ps.allEnv(), 
        stdio: 'pipe' 
      }
    }, opt);

    this.host = host;
    this.args = [];
    this.sleeping = false;

    // 传递给子进程的参数
    //this.args.push(JSON.stringify(options.params));

    const appPath = path.join(__dirname, 'app.js');
    this.child = fork(appPath, this.args, options.processOptions);

    this.pid = this.child.pid;
    this._init();
  }

  /**
   * 进程初始化
   */
  _init() {
    this.child.on('message', (m) => {
      Log.coreLogger.info(`[ee-core] [jobs/child/forkProcess] from childProcess event-message: ${serialize(m)}`);
      if (m.channel == Channel.process.showException) {
        Log.coreLogger.error(`${m.data}`);
      }
    });

    this.child.on('disconnect', () => {
      Log.coreLogger.info(`[ee-core] [jobs/child/forkProcess] from childProcess event-disconnect !`);
    });

    this.child.on('close', (code, signal) => {
      Log.coreLogger.info(`[ee-core] [jobs/child/forkProcess] from childProcess event-close code:${code}, signal:${signal}`);
    });

    this.child.on('exit', (code, signal) => {
      Log.coreLogger.info(`[ee-core] [jobs/child/forkProcess] from childProcess event-exit code:${code}, signal:${signal}`);
    });

    this.child.on('error', (err) => {
      Log.coreLogger.error(`[ee-core] [jobs/child/forkProcess] from childProcess event-error: ${err} !`);
    });
  }

  /**
   * 进程挂起
   */
  sleep() {
    if (this.sleeping) return;
    process.kill(this.pid, 'SIGSTOP');
    this.sleeping = true;
  }

  /**
   * 进程唤醒
   */
  wakeup() {
    if (!this.sleeping) return;
    process.kill(this.pid, 'SIGCONT');
    this.sleeping = false;
  }

}

module.exports = ForkProcess;