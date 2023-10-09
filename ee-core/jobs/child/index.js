const EventEmitter = require('events');
const ForkProcess = require('./forkProcess');
const Loader = require('../../loader');
const Channel = require('../../const/channel');
const Conf = require('../../config');

class ChildJob extends EventEmitter {

  constructor() {
    super();
    this.jobs = {};
    this.config = {};

    const cfg = Conf.getValue('jobs');
    if (cfg) {
      this.config = cfg;
    }

    this._initEvents();
  }

  /**
   * 初始化监听
   */  
  _initEvents() {
    this.on(Channel.events.childProcessExit, (data) => {
      delete this.jobs[data.pid];
    });
    this.on(Channel.events.childProcessError, (data) => {
      delete this.jobs[data.pid];
    });
  }

  /**
   * 执行一个job文件
   */  
  exec(filepath, params = {}, opt = {}) {
    const jobPath = Loader.getFullpath(filepath);
    const proc = this.createProcess(opt);
    const cmd = 'run';
    proc.dispatch(cmd, jobPath, params);
  
    return proc;
  }

  /**
   * 创建子进程
   */  
  createProcess(opt = {}) {
    let options = Object.assign({
      processArgs: {
        type: 'childJob'
      }
    }, opt);
    const proc = new ForkProcess(this, options);
    if (!proc) {
      let errorMessage = `[ee-core] [jobs/child] Failed to obtain the child process !`
      throw new Error(errorMessage);
    }
    this.jobs[proc.pid] = proc;

    return proc;
  }

  /**
   * 获取当前pids
   */  
  getPids() {
    let pids = Object.keys(this.jobs);
    return pids;
  }  

  /**
   * 异步执行一个job文件 todo this指向
   */
  async execPromise(filepath, params = {}, opt = {}) {
    return this.exec(filepath, params, opt);
  }

}

module.exports = ChildJob;
