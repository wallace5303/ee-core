const EventEmitter = require('events');
const LoadBalancer = require('../load-balancer');
const Loader = require('../../loader');
const Helper = require('../../utils/helper');
const UtilsIs = require('../../utils/is');
const Log = require('../../log');
const ForkProcess = require('../child/forkProcess');

class ChildPoolJob extends EventEmitter {

  constructor() {
    super();
    this.boundMap = new Map();
    this.connectionsMap={};
    this.connectionsTimer = null;
    this.children = {};
    this.childrenArr = [];
    this.childIndex = 0;
    this.min = 3;
    this.max = 6;
    this.strategy = 'polling';
    this.weights = new Array(this.max).fill().map((v, i) => {
      //(UtilsIs.validValue(weights[i]) ? weights[i] : 1)
      return 1;
    });
  }

  /**
   * 创建一个池子
   */  
  async create(number = 3) {
    
    // 最大限制
    let currentNumber = this.children.length;
    if (number + currentNumber > this.max) {
      number = this.max - currentNumber;
    }

    // 预留
    let options = {};
    let cJob = new ChildJob();
    let subJob;
    for (let i = 1; i <= number; i++) {
      subJob = new ForkProcess(this, options);
      subJob = cJob.createProcess();
      this._childCreated(subProcess);
    }
  
    let pids = Object.keys(this.children);

    return pids;
  }

  /**
   * 子进程创建后处理
   */  
  _childCreated(subProcess) {
    let pid = subProcess.pid;
    this.children[pid] = subProcess;
    // const length = Object.keys(this.children).length;
    // console.log('length:', length);

    // this.LB.add({
    //   id: subProcess.pid,
    //   weight: this.weights[length - 1],
    // });
    // this.lifecycle.watch([pid]);
  }

  /**
   * 执行一个job文件
   */  
  run(filepath, params = {}, opt = {}) {
    const jobPath = Loader.getFullpath(filepath);
    const boundId = opt.boundId || null;

    // 消息对象
    const mid = Helper.getRandomString();
    const msg = {
      mid,
      jobPath,
      jobParams: params
    }

    let subProcess;
    if (boundId) {
      subProcess = this.getBoundChild(boundId);
    } else {
      subProcess = this.getChild();
    }

    // 发消息到子进程
    subProcess.child.send(msg);

    return subProcess;
  }

  /**
   * 异步执行一个job文件
   */
  async runPromise(filepath, params = {}, opt = {}) {
    return this.run(filepath, params, opt);
  }  

  /**
   * 获取绑定的进程对象
   */  
  getBoundChild(boundId) {
    let proc;
    const boundPid = this.boundMap.get(boundId);
    if (boundPid) {
      proc = this.children[boundPid];
      return proc;
    }

    // 获取进程并绑定
    proc = this.getChild();
    this.boundMap.set(boundId, proc.pid);

    return proc;
  }

  /**
   * 获取一个子进程对象
   */  
  getChild() {
    let subProcess;
    const currentPids = Object.keys(this.children);

    // 没有则创建
    if (currentPids.length == 0) {
      let subIds = this.create(1);
      subProcess = this.children[subIds[0]];
    } else {
      // todo 从池子中获取一个
      //let lbPid = this.LB.pickOne().id;      
      const latestPids = Object.keys(this.children);
      let onePid = latestPids[0];
      subProcess = this.children[onePid];
    }
    
    if (!subProcess) {
      let errorMessage = `[ee-core] [jobs/child-pool] Failed to obtain the child process !`
      throw new Error(errorMessage);
    }

    return subProcess;
  }

  /**
   * 获取子进程对象 （一个或多个）
   */  
  // getChildren(number = 1) {
  //   const subProcesses = {};
    
  //   const currentPids = Object.keys(this.children);
  //   const processNumber = currentPids.length;

  //   // 小于最小值，则创建
  //   if (processNumber < this.min) {
  //     const addNumber = this.min - processNumber;
  //     this.create(addNumber);
  //   }
  //   // 从池子中获取一个
  //   const latestPids = Object.keys(this.children);
  //   //let lbPid = this.LB.pickOne().id;
  //   let onePid = latestPids[0];
  //   subProcess = this.children[onePid];

  //   // 进程绑定ID，保留一个默认值
  //   // if (boundId && boundId !== 'default') {
  //   //   this.pidMap.set(boundId, subProcess.pid);
  //   // }   
    
    
  // }

}

module.exports = ChildPoolJob;
