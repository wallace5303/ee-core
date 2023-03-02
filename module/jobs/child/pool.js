const EventEmitter = require('events');
const path = require('path');
const fs = require('fs');
const ForkProcess = require('./forkProcess');
const Ps = require('../../ps');
const Loader = require('../../loader');
const Log = require('../../log');

class ChildJob {

  /**
    * constructor
    */
  constructor(name, filepath, opt) {
    this.pools = new Map();
    this.create(name, filepath, opt);
  }

  _initEvents() {
    // ddd

  }

  create(name, filepath, opt = {}) {

    const isAbsolute = path.isAbsolute(filepath);
    if (!isAbsolute) {
      filepath = path.join(Ps.getBaseDir(), filepath);
    }

    const fullpath = Loader.resolveModule(filepath);
    if (!fs.existsSync(fullpath)) {
      throw new Error(`[ee-core] [jobs/child] file ${fullpath} not exists`);
    }

    let options = Object.assign({
      scriptArgs: {
        name: name,
        jobPath: fullpath
      },
      processArgs: [],
      processOptions: { 
        //cwd: path.dirname(filepath),
        env: Ps.allEnv(), 
        stdio: 'pipe' 
      }
    }, opt);

    const subProcess = new ForkProcess(this, options);
    this.pools.set(subProcess.pid, subProcess);

    return subProcess;
  }

  sendToChild(pid, message, ...other) {
    if (!this.pools.has(pid)) {
      Log.coreLogger.warn(`[ee-core] [jobs/child] process dose not exist  ${pid}`);
      return;
    }
    const subProcess = this.pools.get(pid);
    subProcess.child.send(message, ...other);
    return
  }

}

module.exports = ChildJob;
