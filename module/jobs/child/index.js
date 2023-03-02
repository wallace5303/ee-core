const EventEmitter = require('events');
const path = require('path');
const fs = require('fs');
const ForkProcess = require('./forkProcess');
const Ps = require('../../ps');
const Loader = require('../../loader');

class ChildJob extends EventEmitter {

  constructor() {
    super();
  }

  /**
   * 执行一个job文件
   */  
  exec(filepath, opt = {}) {
    const jobPath = this._getFullpath(filepath);
    let options = Object.assign({
      times: 1,
      params: {
        jobPath,
        jobParams: {}
      },
    }, opt);

    for (let i = 1; i <= options.times; i++) {
      new ForkProcess(this, options);
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
