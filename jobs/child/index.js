const EventEmitter = require('events');
const ForkProcess = require('./forkProcess');
const Loader = require('../../loader');
const Helper = require('../../utils/helper');
const Channel = require('../../const/channel');

class ChildJob extends EventEmitter {

  constructor() {
    super();
    this.jobs = {};
    this._initEvents();
  }

  /**
   * 初始化监听
   */  
  _initEvents = () => {
    this.on(Channel.events.childJobExit, (data) => {
      delete this.jobs[data.pid];
    });
    this.on(Channel.events.childJobError, (data) => {
      delete this.jobs[data.pid];
    });
  }

  /**
   * 执行一个job文件
   */  
  exec(filepath, params = {}, opt = {}) {
    const jobPath = Loader.getFullpath(filepath);
    const proc = this.createProcess(opt);
    const command = 'run';
    this.sendToChild(proc.pid, command, jobPath, params);
  
    return proc;
  }

  /**
   * 发送消息到子进程的app入口
   */
  sendToChild(pid, cmd, jobPath = '', params = {}) {
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
    const subProcess = this.jobs[pid];
    subProcess.child.send(msg);
  }

  /**
   * 发送消息
   */
  // send(pid, cmd, jobPath = '', params = {}) {
  //   // 消息对象
  //   const mid = Helper.getRandomString();
  //   let msg = {
  //     mid,
  //     cmd: 'run',
  //     jobPath: this.jobPath,
  //     jobParams: params
  //   }

  //   // todo 是否会发生监听未完成时，接收不到消息？
  //   // 发消息到子进程
  //   this.jobProcess.child.send(msg);
  // }

  /**
   * 创建子进程
   */  
  createProcess(opt = {}) {
    const proc = new ForkProcess(this, opt);
    this.jobs[proc.pid] = proc;

    return proc;
  }

  /**
   * 异步执行一个job文件 todo this指向
   */
  async execPromise(filepath, params = {}, opt = {}) {
    return this.exec(filepath, params, opt);
  }

}

module.exports = ChildJob;
