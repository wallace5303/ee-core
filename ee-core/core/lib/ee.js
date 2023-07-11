const assert = require('assert');
const fs = require('fs');
const KoaApplication = require('koa');
const is = require('is-type-of');
const co = require('../../utils/co');
const BaseContextClass = require('./utils/base_context_class');
const utils = require('./utils');
const Timing = require('./utils/timing');
const EggConsoleLogger = require('egg-logger').EggConsoleLogger;
const debug = require('debug')('ee-core:EeCore');
const EE_LOADER = Symbol.for('ee#loader');

class EeCore extends KoaApplication {

  /**
   * @class
   * @param {Object} options - options
   * @since 1.0.0
   */
  constructor(options = {}) {
    options.type = options.type || 'application';

    assert(typeof options.baseDir === 'string', 'options.baseDir required, and must be a string');
    // assert(fs.existsSync(options.baseDir), `Directory ${options.baseDir} not exists`);
    // assert(fs.statSync(options.baseDir).isDirectory(), `Directory ${options.baseDir} is not a directory`);

    super();

    // todo 
    //this.context = null;

    this.timing = new Timing();

    this.console = new EggConsoleLogger({level: 'INFO'});

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
