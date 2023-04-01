const EventEmitter = require('events');
const ForkProcess = require('./forkProcess');
const Loader = require('../../loader');
const Helper = require('../../utils/helper');

class ChildJob extends EventEmitter {

  constructor() {
    super();
    this.jobProcess = null;
    this.jobPath = null;
    this.initEvents();
  }

  /**
   * 初始化监听
   */  
  initEvents = () => {

    // this.on('forked_message', ({data, id}) => {
    //   this.onMessage({data, id});
    // });
  }

  /**
   * 执行一个job文件
   */  
  exec(filepath, params = {}, opt = {}) {
    this.jobPath = Loader.getFullpath(filepath);

    const proc = this.createProcess(opt);

    this.send(params);
  
    return proc;
  }

  /**
   * 发送消息
   */
  send(params = {}) {
    // 消息对象
    const mid = Helper.getRandomString();
    const jobPath = this.jobPath;
    let msg = {
      mid,
      jobPath,
      jobParams: params
    }

    // todo 是否会发生监听未完成时，接收不到消息？
    // 发消息到子进程
    this.jobProcess.child.send(msg);
  }

  /**
   * 创建子进程
   */  
  createProcess(opt = {}) {
    this.jobProcess = new ForkProcess(this, opt);
  
    return this.jobProcess;
  }

  /**
   * 异步执行一个job文件 todo this指向
   */
  async execPromise(filepath, params = {}, opt = {}) {
    return this.exec(filepath, params = {}, opt = {});
  }

}

module.exports = ChildJob;
