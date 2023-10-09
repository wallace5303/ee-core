const EventEmitter = require('events');
const LoadBalancer = require('../load-balancer');
const Loader = require('../../loader');
const ForkProcess = require('../child/forkProcess');
const Channel = require('../../const/channel');
const Helper = require('../../utils/helper');
const Conf = require('../../config');

class ChildPoolJob extends EventEmitter {

  constructor(opt = {}) {
    super();
    let options = Object.assign({
      weights: [],
    }, opt);

    this.config = {};
    this.boundMap = new Map();
    this.children = {};
    this.min = 3;
    this.max = 6;
    this.strategy = 'polling';
    this.weights = new Array(this.max).fill().map((v, i) => {
      let w = Helper.validValue(options.weights[i]) ? options.weights[i] : 1
      return w;
    });

    let lbOpt = {
      algorithm: LoadBalancer.Algorithm.polling,
      targets: [],
    }
    this.LB = new LoadBalancer(lbOpt);

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
      this._removeChild(data.pid);
    });
    this.on(Channel.events.childProcessError, (data) => {
      this._removeChild(data.pid);
    });
  }

  /**
   * 移除对象
   */  
  _removeChild(pid) {
    const length = Object.keys(this.children).length;
    const lbOpt = {
      id: pid,
      weight: this.weights[length - 1],
    }
    this.LB.del(lbOpt);
    delete this.children[pid];
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
  async runPromise(filepath, params = {}) {
    return this.run(filepath, params);
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
   * kill all 
   * @param type {String} - 'sequence' | 'parallel'
   */
  killAll(type = 'parallel') {
    let i = 1;
    Object.keys(this.children).forEach(key => {
      let proc = this.children[key];
      if (proc) {
        if (type == 'sequence') {
          setTimeout(()=>{
            proc.kill();
          }, i * 1000)
          i++;
        } else {
          proc.kill();
        }
      }
    });
  }
}

module.exports = ChildPoolJob;
