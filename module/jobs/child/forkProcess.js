const path = require('path');
const { fork } = require('child_process');
const Log = require('../../log');

class ForkProcess {
  constructor(host, opt = {}) {
    this.host = host;
    this.args = [];
    this.sleeping = false;

    // 传递给子进程的参数
    this.args.push(JSON.stringify(opt.scriptArgs));

    const appPath = path.join(__dirname, 'app.js');
    this.child = fork(appPath, this.args, opt.processOptions);

    this.pid = this.child.pid;
    this._init();
  }

  /**
   * 进程初始化
   */
  _init() {
    this.child.on('message', (data) => {
      Log.coreLogger.info(`[ee-core] [module/jobs/child/forkProcess] from childProcess event-message ${data}`);
    });

    this.child.on('disconnect', () => {
      Log.coreLogger.info(`[ee-core] [module/jobs/child/forkProcess] from childProcess event-disconnect !`);
      // this.host.emit('forked_error', err, this.pid);
    });

    this.child.on('close', (code, signal) => {
      Log.coreLogger.info(`[ee-core] [module/jobs/child/forkProcess] from childProcess event-close code:${code}, signal:${signal}`);
    });

    this.child.on('exit', (code, signal) => {
      Log.coreLogger.info(`[ee-core] [module/jobs/child/forkProcess] from childProcess event-exit code:${code}, signal:${signal}`);
    });

    this.child.on('error', (err) => {
      Log.coreLogger.error(`[ee-core] [module/jobs/child/forkProcess] from childProcess event-error :${err} !`);
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