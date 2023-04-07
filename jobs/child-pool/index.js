const EventEmitter = require('events');
const LoadBalancer = require('../load-balancer');
const Loader = require('../../loader');
const ForkProcess = require('../child/forkProcess');
const Channel = require('../../const/channel');
const Helper = require('../../utils/helper');

class ChildPoolJob extends EventEmitter {

  constructor(opt = {}) {
    super();
    let options = Object.assign({
      weights: [],
    }, opt);

    this.boundMap = new Map();
    this.connectionsMap={};
    this.connectionsTimer = null;
    this.children = {};
    // this.childrenArr = [];
    // this.childIndex = 0;
    this.min = 3;
    this.max = 6;
    this.strategy = 'polling';
    this.weights = new Array(this.max).fill().map((v, i) => {
      (Helper.validValue(options.weights[i]) ? options.weights[i] : 1)
    });

    let lbOpt = {
      algorithm: LoadBalancer.Algorithm.polling,
      targets: [],
    }
    this.LB = new LoadBalancer(lbOpt);
    this._initEvents();
  }

  /**
   * 初始化监听
   */  
  _initEvents = () => {
    this.on(Channel.events.childProcessExit, (data) => {
      delete this.children[data.pid];
    });
    this.on(Channel.events.childProcessError, (data) => {
      delete this.children[data.pid];
    });
  }  

  /**
   * 创建一个池子
   */  
  async create(number = 3) {
    if (number < 0 || number > this.max) {
      throw new Error(`[ee-core] [jobs/child-pool] The number is invalid !`);
    }
    let currentNumber = this.children.length;
    if (currentNumber > this.max) {
      throw new Error(`[ee-core] [jobs/child-pool] The number of current processes number: ${currentNumber} is greater than the maximum: ${this.max} !`);
    }

    if (number + currentNumber > this.max) {
      number = this.max - currentNumber;
    }

    // args
    let options = Object.assign({
      processArgs: {
        type: 'childPoolJob'
      }
    }, {});
    for (let i = 1; i <= number; i++) {
      let task = new ForkProcess(this, options);
      this._childCreated(task);
    }
  
    let pids = Object.keys(this.children);

    return pids;
  }

  /**
   * 子进程创建后处理
   */  
  _childCreated(childProcess) {
    let pid = childProcess.pid;
    this.children[pid] = childProcess;

    const length = Object.keys(this.children).length;
    let lbTask = {
      id: pid,
      weight: this.weights[length - 1],
    }
    this.LB.add(lbTask);

    // console.log('----------- createPId:', pid);
    // this.lifecycle.watch([pid]);
  }

  /**
   * 执行一个job文件
   */  
  run(filepath, params = {}) {
    const jobPath = Loader.getFullpath(filepath);
    const childProcess = this.getChild();
    childProcess.dispatch('run', jobPath, params);

    return childProcess;
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
   * 通过pid获取一个子进程对象
   */  
  getChildByPid(pid) {
    let proc = this.children[pid] || null;
    return proc;
  }

  /**
   * 获取一个子进程对象
   */  
  getChild() {
    let proc;
    const currentPids = Object.keys(this.children);

    // 没有则创建
    if (currentPids.length == 0) {
      let subIds = this.create(1);
      proc = this.children[subIds[0]];
    } else {
      // 从池子中获取一个
      let onePid = this.LB.pickOne().id;
      proc = this.children[onePid];

      //console.log('----------- onePid:', onePid);
      // old
      // const latestPids = Object.keys(this.children);
      // let onePid = latestPids[0];
    }
    
    if (!proc) {
      let errorMessage = `[ee-core] [jobs/child-pool] Failed to obtain the child process !`
      throw new Error(errorMessage);
    }

    return proc;
  }

  /**
   * 获取当前pids
   */  
  getPids() {
    let pids = Object.keys(this.children);
    return pids;
  }   

  /**
    * onForkedDisconnect [triggered when a process instance disconnect]
    * @param  {[String]} pid [process pid]
    */
  // onForkedDisconnect = (pid) => {
  //   const length = this.forked.length;

  //   removeForkedFromPool(this.forked, pid, this.pidMap);
  //   this.forkedMap = convertForkedToMap(this.forked);
  //   this.LB.del({
  //     id: pid,
  //     weight: this.weights[length - 1],
  //   });
  //   this.lifecycle.unwatch([pid]);
  //   EventCenter.emit('process-manager:unlisten', [pid]);
  // }

}

module.exports = ChildPoolJob;
