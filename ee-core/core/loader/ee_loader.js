'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const is = require('is-type-of');
const debug = require('debug')('ee-core:EeLoader');
const FileLoader = require('./file_loader');
const ContextLoader = require('./context_loader');
const Utils = require('../utils');
const Timing = require('../utils/timing');
const Ps = require('../../../ps');

const REQUIRE_COUNT = Symbol('EeLoader#requireCount');

class EeLoader {

  /**
   * @class
   * @param {Object} options - options
   * @param {String} options.baseDir - the directory of application
   * @param {EeCore} options.app - Application instance
   * @param {Logger} options.logger - logger
   * @since 1.0.0
   */
  constructor(options) {
    this.options = options;

    this.timing = this.app.timing || new Timing();
    this[REQUIRE_COUNT] = 0;
 
  }


  /**
   * Load files using {@link ContextLoader}
   * @param {String|Array} directory - see {@link ContextLoader}
   * @param {String} property - see {@link ContextLoader}
   * @param {Object} opt - see {@link ContextLoader}
   * @since 1.0.0
   */
  loadToContext(directory, property, opt) {
    opt = Object.assign({}, {
      directory,
      property,
      inject: this.app,
      loader: this
    }, opt);
    const timingKey = `Load "${String(property)}" to Context`;
    this.timing.start(timingKey);
    if (['addon'].includes(property)) {
      new ContextLoader(opt).loadAddons();
    } else {
      new ContextLoader(opt).load();
    }
    
    this.timing.end(timingKey);
  }
 
}


module.exports = EeLoader;
