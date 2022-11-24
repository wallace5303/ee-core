'use strict';

const debug = require('debug')('ee-core:addon');
const path = require('path');
const fs = require('fs');
const assert = require('assert');
const globby = require('globby');

module.exports = {

  /**
   * Load app/addon
   * @param {Object} opt - LoaderOptions
   * @function 
   * @since 1.0.0
   */
  loadAddon(opt) {
    this.timing.start('Load Addon');

    // const target = {};
    // const files = '*';
    // const directory = path.join(this.options.framework, 'addon');
    // const addonpaths = globby.sync(files, { cwd: directory, deep: 1, onlyDirectories: true});
    // for (const addonName of addonpaths) {
    //   const fullpath = path.join(directory, addonName, 'index');
    //   let file = this.resolveModule(fullpath);
    //   if (!fs.statSync(file).isFile()) continue;
    //   target[addonName] = this.loadFile(fullpath);
    // }
    // this.addon = target;

    opt = Object.assign({
      call: true,
      caseStyle: 'lower',
      directory: path.join(this.options.framework, 'addon')
    }, opt);

    const addonPaths = opt.directory;
    this.loadToContext(addonPaths, 'addon', opt);    
    
    this.timing.end('Load Addon');
  },
};


