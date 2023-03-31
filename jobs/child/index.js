const EventEmitter = require('events');
const ForkProcess = require('./forkProcess');
const Loader = require('../../loader');
const Helper = require('../../utils/helper');

class ChildJob extends EventEmitter {

  constructor() {
    super();
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
    const jobPath = Loader.getFullpath(filepath);

    // 消息对象
    const mid = Helper.getRandomString();
    let msg = {
      mid,
      jobPath,
      jobParams: params
    }

    let subProcess = new ForkProcess(this, opt);

    // todo 是否会发生监听未完成时，接收不到消息？
    // 发消息到子进程
    subProcess.child.send(msg);
  
    return subProcess;
  }

  /**
   * 异步执行一个job文件
   */
  async execPromise(filepath, params = {}, opt = {}) {
    return this.exec(filepath, params = {}, opt = {});
  }

}

module.exports = ChildJob;
