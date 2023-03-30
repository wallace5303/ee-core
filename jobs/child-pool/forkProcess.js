const path = require('path');
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

    this.host = host;
    this.args = options.processArgs;
    this.sleeping = false;

    this.child = fork(appPath, this.args, options.processOptions);
    this.pid = this.child.pid;
    this._init();
  }

  /**
   * 进程初始化
   */
  _init() {
    this.child.on('message', (m) => {
      Log.coreLogger.info(`[ee-core] [jobs/child] received a message from child-process, message: ${serialize(m)}`);
      if (m.channel == Channel.process.showException) {
        Log.coreLogger.error(`${m.data}`);
      }

      // 收到子进程消息，转发到 event 
      if (m.channel == Channel.process.sendToMain) {
        this.host.emit(m.event, m.data);
      }

    });

    this.child.on('exit', (code, signal) => {
      Log.coreLogger.info(`[ee-core] [jobs/child] received a exit from child-process, code:${code}, signal:${signal}`);
    });

    this.child.on('error', (err) => {
      Log.coreLogger.error(`[ee-core] [jobs/child] received a error from child-process, error: ${err} !`);
    });
  }

}

module.exports = ForkProcess;