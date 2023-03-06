const path = require('path');
const fs = require('fs');
const RendererJob = require('./renderer');
const ChildJob = require('./child/pool');
const Ps = require('../ps');
const Loader = require('../loader');

class Jobs  {
  constructor() {
    this.type;
    this.dev;
    this.path;
    this.instance;
    this.child;
    this.childOptions;
    this.renderer;
    this.winOptions;
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
      this.path = path.join(Ps.getBaseDir(), this.path);
    }
    const filepath = Loader.resolveModule(this.path);

    if (!fs.existsSync(filepath)) {
      throw new Error(`[ee-core] [jobs-create] file ${this.path} not exists`);
    }
    
    this.path = filepath;
    if (this.type == 'child') {
      this.instance = new ChildJob(name, filepath, this.childOptions);
      this.child = this.instance;
    } else if (this.type == 'renderer') {
      this.instance = new RendererJob(name, filepath, this.winOptions);
      this.renderer = this.instance;

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