'use strict';

const debug = require('debug')('ee-core:addon');
const path = require('path');
const fs = require('fs');
const assert = require('assert');
const globby = require('globby');
const utils = require('../../utils/index');

module.exports = {

  /**
   * Load app/addon
   * @param {Object} opt - LoaderOptions
   * @function 
   * @since 1.0.0
   */
  loadAddon() {
    this.timing.start('Load Addon');

    const target = {};

    const files = '*';
    const directory = path.join(this.options.framework, 'addon');
    const addonpaths = globby.sync(files, { cwd: directory, deep: 1, onlyDirectories: true});
    for (const addonName of addonpaths) {
      const fullpath = path.join(directory, addonName, 'index');
      let file = this.resolveModule(fullpath);
      if (!fs.statSync(file).isFile()) continue;
      target[addonName] = this.loadFile(fullpath);
      console.log('addonName:', addonName);
    }

    // // 载入到 app.serviceClasses
    // let opt = Object.assign({
    //   call: true,
    //   caseStyle: 'lower',
    //   fieldClass: 'serviceClasses',
    //   directory: path.join(this.options.framework, 'controller'),
    // }, opt);    
    // this.loadToApp(controllerBase, 'controller', opt);
    this.addon = target;
    this.timing.end('Load Addon');
  },
};


