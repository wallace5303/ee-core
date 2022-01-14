'use strict';

const assert = require('assert');
const fs = require('fs');
const KoaApplication = require('koa');
const is = require('is-type-of');
const co = require('co');
const BaseContextClass = require('./utils/base_context_class');
const utils = require('./utils');
const Timing = require('./utils/timing');

const ROUTER = Symbol('EeCore#router');
const EE_LOADER = Symbol.for('ee#loader');
const CLOSE_PROMISE = Symbol('EeCore#closePromise');

class EeCore extends KoaApplication {

  /**
   * @class
   * @param {Object} options - options
   * @since 1.0.0
   */
  constructor(options = {}) {
    assert(typeof options.electronDir === 'string', 'options.electronDir required, and must be a string');
    assert(fs.existsSync(options.electronDir), `Directory ${options.electronDir} not exists`);
    assert(fs.statSync(options.electronDir).isDirectory(), `Directory ${options.electronDir} is not a directory`);

    super();

    this.timing = new Timing();

    /**
     * @member {Object} EeCore#options
     * @private
     * @since 1.0.0
     */
    this._options = this.options = options;

    /**
     * @member {BaseContextClass} EeCore#BaseContextClass
     * @since 1.0.0
     */
    this.BaseContextClass = BaseContextClass;

    /**
     * Base controller to be extended by controller in `app.controller`
     * @class Controller
     * @extends BaseContextClass
     * @example
     * class UserController extends app.Controller {}
     */
    const Controller = this.BaseContextClass;

    /**
     * Retrieve base controller
     * @member {Controller} EeCore#Controller
     * @since 1.0.0
     */
    this.Controller = Controller;

    /**
     * Base service to be extended by services in `app.service`
     * @class Service
     * @extends BaseContextClass
     * @example
     * class UserService extends app.Service {}
     */
    const Service = this.BaseContextClass;

    /**
     * Retrieve base service
     * @member {Service} EeCore#Service
     * @since 1.0.0
     */
    this.Service = Service;

    /**
     * The loader instance, the default class is {@link EeLoader}.
     * If you want define
     * @member {EeLoader} EeCore#loader
     * @since 1.0.0
     */
    const Loader = this[EE_LOADER];
    assert(Loader, 'Symbol.for(\'ee#loader\') is required');
    this.loader = new Loader({
      baseDir: options.baseDir,
      electronDir: options.electronDir,
      app: this,
      env: options.env,
    });
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
   * The current directory of application
   * @member {String}
   * @see {@link AppInfo#baseDir}
   * @since 1.0.0
   */
  get baseDir() {
    return this.options.baseDir;
  }

  /**
   * The electron current directory of application
   * @member {String}
   * @see {@link AppInfo#electronDir}
   * @since 1.0.0
   */
  get electronDir() {
    return this.options.electronDir;
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

// delegate all router method to application
// utils.methods.concat([ 'all', 'resources', 'register', 'redirect' ]).forEach(method => {
//   EeCore.prototype[method] = function(...args) {
//     this.router[method](...args);
//     return this;
//   };
// });

module.exports = EeCore;
