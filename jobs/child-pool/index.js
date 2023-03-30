const EventEmitter = require('events');
const ForkProcess = require('./forkProcess');
const LoadBalancer = require('../load-balancer');
const Loader = require('../../loader');
const Helper = require('../../utils/helper');
const UtilsIs = require('../../utils/is');

class ChildPoolJob extends EventEmitter {

  constructor() {
    super();
    this.pidMap = new Map();
    this.connectionsMap={};
    this.connectionsTimer = null;
    this.children = {};
    this.childrenArr = [];
    this.childIndex = 0;
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
  create(number = 3) {

    // 最大限制
    let currentNumber = this.childs.length;
    if (number + currentNumber > this.max) {
      number = this.max - currentNumber;
    }

    // 预留
    let options = {};
    let subProcess;
    for (let i = 1; i <= number; i++) {
      subProcess = new ForkProcess(this, options);
      this._childCreated(subProcess);
    }
  
    return;
  }

  /**
   * 子进程创建后处理
   */  
  _childCreated(subProcess) {
    let pid = subProcess.pid;
    this.children[pid] = subProcess;
    const length = Object.keys(this.children).length;
    console.log('length:', length);

    // this.LB.add({
    //   id: subProcess.pid,
    //   weight: this.weights[length - 1],
    // });
    // this.lifecycle.watch([pid]);
  }

  /**
   * 执行一个job文件
   */  
  exec(filepath, params = {}, opt = {}) {
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
    // 进程绑定ID，该进程只处理此ID类型的任务。
    const boundPid = this.pidMap.get(boundId);
    if (boundPid) {
      subProcess = this.children[boundPid];
    } else {
      const length = Object.keys(this.children).length;
      if (length < this.max) {

      } else {
      // get a process from the pool based on load balancing strategy
        forked = this.forkedMap[this.LB.pickOne().id];
      }
      if (id !== 'default') {
        this.pidMap.set(id, forked.pid);
      }
      if (this.pidMap.keys.length === 1000) {
        console.warn('ChildProcessPool: The count of pidMap is over than 1000, suggest to use unique id!');
      }
    }

    if (!subProcess) {
      throw new Error(`get a process from ChildPoolJob failed! the process pid: ${boundPid}.`);
    }

    // 发消息到子进程
    subProcess.child.send(msg);

    return subProcess;
  }

}

module.exports = ChildPoolJob;
