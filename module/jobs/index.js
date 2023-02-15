const path = require('path');
const fs = require('fs');
const assert = require('assert');
const RendererJob = require('./renderer');
const utils = require('../utils');
const loader = require('../loader');

class Jobs  {
  constructor() {
    this.type = undefined;
    this.instance = undefined;
  }

  /**
   * 创建 job
   */
  create (name, opt = {}) {
    this.type = opt.type || 'renderer';
    this.dev = opt.dev || false;
    this.winOptions = opt.winOptions || {};
    this.path = opt.path || null;

    const isAbsolute = path.isAbsolute(this.path);
    if (!isAbsolute) {
      this.path = path.join(utils.getBaseDir(), 'jobs', this.path);
    }
    console.log('[ee-core:job] this.path: ', this.path);
    const filepath = loader.resolveModule(this.path);

    assert(fs.existsSync(filepath), `file ${filepath} not exists`);

    this.path = filepath;

    if (this.type == 'browser') {
      this.instance = new RendererJob(name, filepath, this.winOptions);
    }

    if (this.dev) {
      this.openDevTools();
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