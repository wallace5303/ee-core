const EventEmitter = require('events');
const path = require('path');
const fs = require('fs');
const ForkProcess = require('./forkProcess');
const Ps = require('../../ps');
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
    const jobPath = this._getFullpath(filepath);

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
   * todo 运行job
   */  
  run(name, filepath, opt = {}) {
    let times = opt.times || 1;

    for (let i = 1; i <= times; i++) {
      this.exec(filepath, opt);
    }
  
    return;
  }

  _getFullpath(filepath) {
    const isAbsolute = path.isAbsolute(filepath);
    if (!isAbsolute) {
      filepath = path.join(Ps.getBaseDir(), filepath);
    }

    const fullpath = Loader.resolveModule(filepath);
    if (!fs.existsSync(fullpath)) {
      throw new Error(`[ee-core] [jobs/child] file ${fullpath} not exists`);
    }

    return fullpath;
  }

}

module.exports = ChildJob;
