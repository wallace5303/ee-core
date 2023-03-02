const path = require('path');
const { fork } = require('child_process');
const Log = require('../../log');
const Ps = require('../../ps');

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
    this.args.push(JSON.stringify(options.params));

    const appPath = path.join(__dirname, 'app.js');
    this.child = fork(appPath, this.args, options.processOptions);

    this.pid = this.child.pid;
    this._init();
  }

  /**
   * 初始化事件监听
   */
  _init() {
    // this.child.on('exit', (code, signal) => {
    //   Log.coreLogger.info(`[ee-core] [jobs/child/forkProcess] from childProcess event-exit code:${code}, signal:${signal}`);
    // });
  }
}

module.exports = ForkProcess;