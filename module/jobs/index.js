const path = require('path');
const fs = require('fs');
const RendererJob = require('./renderer');
const ChildJob = require('./child');
const Utils = require('../utils');
const Loader = require('../loader');

class Jobs  {
  constructor() {
    this.type = undefined;
    this.instance = undefined;
  }

  /**
   * 创建 job
   */
  create (name, opt = {}) {
    this.type = opt.type || 'child';
    this.dev = opt.dev || false;
    this.winOptions = opt.winOptions || {};
    this.childOptions = opt.childOptions || {};
    this.path = opt.path || null;


    const isAbsolute = path.isAbsolute(this.path);
    if (!isAbsolute) {
      this.path = path.join(Utils.getBaseDir(), this.path);
    }
    const filepath = Loader.resolveModule(this.path);

    if (!fs.existsSync(filepath)) {
      throw new Error(`[ee-core] [jobs-create] file ${this.path} not exists`);
    }
    
    this.path = filepath;
    if (this.type == 'child') {
      this.instance = new ChildJob(name, filepath, this.childOptions);
    } else if (this.type == 'renderer') {
      this.instance = new RendererJob(name, filepath, this.winOptions);
      if (this.dev) {
        this.openDevTools();
      }
    }
    
    return;
  }

  /**
   * 显示开发者工具栏（仅支持 RendererJob)
   */
  openDevTools () {
    this.instance.openDevTools();
  }
}

module.exports = Jobs;