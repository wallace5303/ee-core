'use strict';

const assert = require('assert');
const is = require('is-type-of');
const co = require('../../utils/co');
const utils = require('./utils');
const Timing = require('./utils/timing');
const debug = require('debug')('core:EeCore');
const Loader = require('./loader/ee_loader');

class EeCore {

  /**
   * @class
   * @param {Object} options - options
   */
  constructor(options = {}) {
    this.timing = new Timing();
    this._options = this.options = options;

    const Loader = this[EE_LOADER];
    assert(Loader, 'Symbol.for(\'ee#loader\') is required');
    let loaderOptions = Object.assign({
      logger: this.console,
      app:this
    }, options);
    this.loader = new Loader(loaderOptions);
  }

  /**
   * override koa's app.use, support generator function
   * @param {Function} fn - middleware
   * @return {Application} app
   * @since 1.0.0
   */
  use(fn) {
    assert(is.function(fn), 'app.use() requires a function');
    debug('use %s', fn._name || fn.name || '-');
    this.middleware.push(utils.middleware(fn));
    return this;
  }

  /**
   * The home directory of application
   * @member {String}
   * @see {@link AppInfo#homeDir}
   * @since 1.0.0
   */
  get homeDir() {
    return this.options.homeDir;
  }

  /**
   * The electron current directory of application
   * @member {String}
   * @see {@link AppInfo#baseDir}
   * @since 1.0.0
   */
  get baseDir() {
    return this.options.baseDir;
  }

  /**
   * The ee-core directory of framework
   * @member {String}
   * @see {@link AppInfo#EeCoreDir}
   * @since 1.0.0
   */
  get eeCoreDir() {
    return this.options.framework;
  }

  /**
   * The name of application
   * @member {String}
   * @see {@link AppInfo#name}
   * @since 1.0.0
   */
  get name() {
    return this.loader ? this.loader.pkg.name : '';
  }

  /**
   * The configuration of application
   * @member {Config}
   * @since 1.0.0
   */
  get config() {
    return this.loader ? this.loader.config : {};
  }

  /**
   * The addon of application
   * @member {Addon}
   * @since 1.0.0
   */
  get addon() {
    return this.loader ? this.loader.addon : {};
  }  

  get [EE_LOADER]() {
    return require('./loader/ee_loader');
  }

  /**
   * Convert a generator function to a promisable one.
   *
   * Notice: for other kinds of functions, it directly returns you what it is.
   *
   * @param  {Function} fn The inputted function.
   * @return {AsyncFunction} An async promise-based function.
   * @example
    ```javascript
     const fn = function* (arg) {
        return arg;
      };
      const wrapped = app.toAsyncFunction(fn);
      wrapped(true).then((value) => console.log(value));
    ```
   */
  toAsyncFunction(fn) {
    if (!is.generatorFunction(fn)) return fn;
    fn = co.wrap(fn);
    return async function(...args) {
      return fn.apply(this, args);
    };
  }

  /**
   * Convert an object with generator functions to a Promisable one.
   * @param  {Mixed} obj The inputted object.
   * @return {Promise} A Promisable result.
   * @example
    ```javascript
     const fn = function* (arg) {
        return arg;
      };
      const arr = [ fn(1), fn(2) ];
      const promise = app.toPromise(arr);
      promise.then(res => console.log(res));
    ```
   */
  toPromise(obj) {
    return co(function* () {
      return yield obj;
    });
  }
}

module.exports = EeCore;
