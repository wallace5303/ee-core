const { fork } = require('child_process');

class ForkProcess {
  constructor(host, modulePath, processArgs = [], processOptions = {}) {
    this.host = host;
    this.modulePath = modulePath;
    this.args = processArgs;
    this.options = processOptions;
    this.sleeping = false;
    this.activitiesCount = 0;
    this.activitiesMap = new Map();

    this.child = fork(
      this.modulePath,
      this.args,
      this.options
    );

    this.pid = this.child.pid;
    this._init();
  }

  /**
   * 进程挂起
   */
  sleep() {
    if (this.activitiesCount) {
      if (this.sleeping) return;
      process.kill(this.pid, 'SIGSTOP');
      this.sleeping = true;
    }
  }

  /**
   * 进程唤醒
   */
  wakeup() {
    if (!this.sleeping) return;
    process.kill(this.pid, 'SIGCONT');
    this.sleeping = false;
  }

  /**
   * 进程初始化
   */
  _init() {
    this.child.on('message', (data) => {
      const id = data.id;
      this.connectionsCountMinus(id);
      delete data.id;
      delete data.action;
      //this.host.emit('forked_message', {data, id});
    });
    this.child.on('exit', (code, signal) => {
      // if (code !== 0 && code !== null) {
      //   this.host.emit('forked_error', code, this.pid);
      // } else {
      //   this.host.emit('forked_exit', this.pid);
      // }
    });
    this.child.on('error', (err) => {
      console.log('forked error: ', err);
      // this.host.emit('forked_error', err, this.pid);
    });
  }

  /**
   * 向进程发消息
   */
  send(params) {
    if (this.sleeping) {
      this.wakeup();
    }
    this.connectionsCountPlus(params.id);
    this.child.send(params);
  }

  /**
   * 连接数+
   */
  _connectionsCountPlus(id) {
    this.activitiesMap.set(id, 1);
    this.activitiesCount += 1;
    this.host.connectionsMap[this.pid] = this.activitiesCount;
  }

  /**
   * 连接数-
   */
  _connectionsCountMinus(id) {
    if (this.activitiesMap.has(id)) {
      this.activitiesCount = (this.activitiesCount > 0) ? (this.activitiesCount - 1) : 0;
      this.activitiesMap.delete(id);
    }
    this.host.connectionsMap[this.pid] = this.activitiesCount;
  }
}

module.exports = ForkProcess;