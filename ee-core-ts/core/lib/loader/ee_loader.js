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
    // assert(fs.existsSync(this.options.baseDir), `${this.options.baseDir} not exists`);
    assert(this.options.app, 'options.app is required');
    assert(this.options.logger, 'options.logger is required');

    this.app = this.options.app;
    this.timing = this.app.timing || new Timing();
    this[REQUIRE_COUNT] = 0;
    
    /**
     * @member {Object} EeLoader#pkg
     * @see {@link AppInfo#pkg}
     * @since 1.0.0
     */
    this.pkg = this.getPkg();

    /**
     * Framework directories
     *
     * @member {Array} EeLoader#EePaths
     * @see EeLoader#getEePaths
     * @since 1.0.0
     */
    this.EePaths = this.getEePaths();
    debug('Loaded EePaths %j', this.EePaths);

    /**
     * @member {String} EeLoader#serverEnv
     * @see AppInfo#env
     * @since 1.0.0
     */
    this.serverEnv = this.getServerEnv();
    debug('Loaded serverEnv %j', this.serverEnv);

    /**
     * @member {AppInfo} EeLoader#appInfo
     * @since 1.0.0
     */
    this.appInfo = this.getAppInfo();

    /**
     * @member {String} EeLoader#serverScope
     * @see AppInfo#serverScope
     */
    this.serverScope = options.serverScope !== undefined
      ? options.serverScope
      : this.getServerScope();
  }

  /**
   * Get {@link AppInfo#env}
   * @return {String} env
   * @see AppInfo#env
   * @private
   * @since 1.0.0
   */
  getServerEnv() {
    let serverEnv = this.options.env;

    if (!serverEnv) {
      throw new Error('[core] [lib] [loader] getServerEnv serverEnv can not be empty!');
    }

    return serverEnv;
  }

  /**
   * Get {@link AppInfo#scope}
   * @return {String} serverScope
   * @private
   */
  getServerScope() {
    return process.env.EE_SERVER_SCOPE || '';
  }

  /**
   * Get {@link AppInfo#name}
   * @return {String} appname
   * @private
   * @since 1.0.0
   */
  getAppname() {
    if (this.pkg.name) {
      debug('Loaded appname(%s) from package.json', this.pkg.name);
      return this.pkg.name;
    }

    throw new Error(`name is required from ${pkg}`);
  }

  /**
   * Get home directory
   * @return {String} home directory
   * @since 3.4.0
   */
  getHomedir() {
    return this.options.homeDir;
  }

  /**
   * Get app info
   * @return {AppInfo} appInfo
   * @since 1.0.0
   */
  getAppInfo() {
    const env = this.serverEnv;
    
    /**
     * Meta information of the application
     * @class AppInfo
     */
    return {
      /**
       * The name of the application, retrieve from the name property in `package.json`.
       * @member {String} AppInfo#name
       */
      name: this.getAppname(),

      /**
       * The current directory, where the application code is.
       * @member {String} AppInfo#baseDir
       */
      baseDir: this.options.baseDir,

      /**
       * The environment of the application, **it's not NODE_ENV**
       *
       * 1. from `$baseDir/config/env`
       * 2. from EE_SERVER_ENV
       * 3. from NODE_ENV
       *
       * env | description
       * ---       | ---
       * test      | system integration testing
       * prod      | production
       * local     | local on your own computer
       * unittest  | unit test
       *
       * @member {String} AppInfo#env
       * @see https://Eejs.org/zh-cn/basics/env.html
       */
      env: env,

      /**
       * @member {String} AppInfo#scope
       */
      scope: this.serverScope,

      /**
       * The use directory, same as `process.env.HOME`
       * @member {String} AppInfo#HOME
       */
      home: this.getHomedir(),

      /**
       * The directory whether is homeDir or appUserData depend on env.
       * @member {String} AppInfo#root
       */
      root: Ps.getRootDir(),

      /**
       * electron application data dir
       * @member {String} AppInfo#appUserDataDir
       */
      appUserDataDir: this.options.appUserData,

      /**
       * system user home dir 
       * @member {String} AppInfo#userHome
       */
      userHome: this.options.userHome,

      /**
       * application version
       * @member {String} AppInfo#appVersion
       */
      appVersion: this.options.appVersion,

      /**
       * application package status
       * @member {boolean} AppInfo#isPackaged
       */      
      isPackaged: this.options.isPackaged,

      /**
       * application exec file dir
       * @member {String} AppInfo#execDir
       */  
      execDir: this.options.execDir
    };
  }

  /**
   * Get {@link EeLoader#EePaths}
   * @return {Array} framework directories
   * @see {@link EeLoader#EePaths}
   * @private
   * @since 1.0.0
   */
  getEePaths() {
    // avoid require recursively
    const EePaths = [];
    EePaths.push(this.app[Symbol.for('ee#eePath')]);

    return EePaths;
  }

  // Low Level API

  /**
   * Load single file, will invoke when export is function
   *
   * @param {String} filepath - fullpath
   * @param {Array} inject - pass rest arguments into the function when invoke
   * @return {Object} exports
   * @example
   * ```js
   * app.loader.loadFile(path.join(app.options.baseDir, 'config/router.js'));
   * ```
   * @since 1.0.0
   */
  loadFile(filepath, ...inject) {
    filepath = filepath && this.resolveModule(filepath);
    if (!filepath) {
      return null;
    }

    // function(arg1, args, ...) {}
    if (inject.length === 0) inject = [ this.app ];

    let ret = this.requireFile(filepath);
    if (is.function(ret) && !is.class(ret) && !Utils.isBytecodeClass(ret)) {
      ret = ret(...inject);
    }
    return ret;
  }

  /**
   * @param {String} filepath - fullpath
   * @return {Object} exports
   * @private
   */
  requireFile(filepath) {
    const timingKey = `Require(${this[REQUIRE_COUNT]++}) ${Utils.getResolvedFilename(filepath, this.options.baseDir)}`;
    this.timing.start(timingKey);
    const ret = Utils.loadFile(filepath);
    this.timing.end(timingKey);
    return ret;
  }

  /**
   * Get all loadUnit
   *
   * loadUnit is a directory that can be loaded by EeLoader, it has the same structure.
   * loadUnit has a path and a type(app, framework, plugin).
   *
   * The order of the loadUnits:
   *
   * 1. plugin
   * 2. framework
   * 3. app
   *
   * @return {Array} loadUnits
   * @since 1.0.0
   */
  getLoadUnits() {
    if (this.dirs) {
      return this.dirs;
    }

    const dirs = this.dirs = [];

    // framework or Ee path
    for (const EePath of this.EePaths) {
      dirs.push({
        path: EePath,
        type: 'framework',
      });
    }

    // application
    dirs.push({
      path: this.options.baseDir,
      type: 'app',
    });

    debug('Loaded dirs %j', dirs);
    return dirs;
  }

  /**
   * Load files using {@link FileLoader}, inject to {@link Application}
   * @param {String|Array} directory - see {@link FileLoader}
   * @param {String} property - see {@link FileLoader}
   * @param {Object} opt - see {@link FileLoader}
   * @since 1.0.0
   */
  loadToApp(directory, property, opt) {
    const target = this.app[property] = {};
    opt = Object.assign({}, {
      directory,
      target,
      inject: this.app,
    }, opt);

    const timingKey = `Load "${String(property)}" to Application`;
    this.timing.start(timingKey);
    new FileLoader(opt).load();
    this.timing.end(timingKey);
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

  /**
   * @member {FileLoader} EeLoader#FileLoader
   * @since 1.0.0
   */
  get FileLoader() {
    return FileLoader;
  }

  /**
   * @member {ContextLoader} EeLoader#ContextLoader
   * @since 1.0.0
   */
  get ContextLoader() {
    return ContextLoader;
  }

  getTypeFiles(filename) {
    const files = [ `${filename}.default` ];
    files.push(`${filename}.${this.serverEnv}`);

    return files;
  }

  resolveModule(filepath) {
    let fullpath;
    try {
      fullpath = require.resolve(filepath);
    } catch (e) {

      // 特殊后缀处理
      if (filepath && (filepath.endsWith('.defalut') || filepath.endsWith('.prod'))) {
        fullpath = filepath + '.jsc';
      } else if (filepath && filepath.endsWith('.js')) {
        fullpath = filepath + 'c';
      }
      
      if (!fs.existsSync(filepath) && !fs.existsSync(fullpath)) {
        //this.options.logger.warn(`[ee-core] [core/lib/loader/ee_loader] resolveModule unknow filepath: ${filepath}`)
        return undefined;
      }
    }

    return fullpath;
  }

  getPkg() {
    const filePath = path.join(this.options.homeDir, 'package.json');
    if (!fs.existsSync(filePath)) {
      throw new Error(filePath + ' is not found');
    }
    const json = JSON.parse(fs.readFileSync(filePath));

    return json;
  }  
}

/**
 * Mixin methods to EeLoader
 * // ES6 Multiple Inheritance
 * https://medium.com/@leocavalcante/es6-multiple-inheritance-73a3c66d2b6b
 */
const loaders = [
  require('./mixin/config'),
  require('./mixin/service'),
  require('./mixin/controller'),
  require('./mixin/addon'),
];

for (const loader of loaders) {
  Object.assign(EeLoader.prototype, loader);
}

module.exports = EeLoader;
