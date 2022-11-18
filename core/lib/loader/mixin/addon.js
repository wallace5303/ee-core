'use strict';

const debug = require('debug')('ee-core:addon');
const path = require('path');
const fs = require('fs');
const assert = require('assert');
const globby = require('globby');
const utils = require('../../utils/index');

module.exports = {

  /**
   * Load config/config.js
   *
   * @function 
   * @since 1.0.0
   */
  loadAddon() {
    this.timing.start('Load Addon');

    const target = {};

    const files = utils.filePatterns();
    const directory = path.join(this.options.framework, 'addon');
    const filepaths = globby.sync(files, { cwd: directory });
    console.log('filepaths:', filepaths);
    // for (const filename of filepaths) {
    //   const fullpath = path.join(directory, filename);
    //   if (!fs.statSync(fullpath).isFile()) continue;

    //   let filepath = this.resolveModule(fullpath);
    
    //   target[filename] = this.loadFile(filepath);
    // }

    this.addon = target;
    this.timing.end('Load Addon');
  },

};


