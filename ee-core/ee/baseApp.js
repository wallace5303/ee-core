const EeAppCore = require('../core/index').EeCore;
const EE_PATH = Symbol.for('ee#eePath');
const path = require('path');
const EE_LOADER = Symbol.for('ee#loader');
const AppLoader = require('./appLoader');
const HttpClient = require('../httpclient');
const HTTPCLIENT = Symbol('EeApplication#httpclient');
const LOGGERS = Symbol('EeApplication#loggers');
const Log = require('../log');
const Conf = require('../config');

class BaseApp extends EeAppCore {
  constructor (options = {}) {

    super(options);

    this.loader.loadConfig();
    
    // 缓存配置
    Conf.setAll(this.config);

    this.loader.load();

    this.HttpClient = HttpClient;
  }

  get [EE_PATH]() {
    return path.join(__dirname, '..');
  }

  get [EE_LOADER]() {
    return AppLoader;
  }

  /**
   *  loggers
   * @member {Object}
   * @since 1.0.0
   */
  get loggers() {
    if (!this[LOGGERS]) {
      this[LOGGERS] = Log.create(this.config);
    }
    return this[LOGGERS];
  }

  /**
   * Get logger by name, it's equal to app.loggers['name'],
   * but you can extend it with your own logical.
   * @param {String} name - logger name
   * @return {Logger} logger
   */
  getLogger(name) {
    return this.loggers[name] || null;
  }

  /**
   * application logger, log file is `$HOME/logs/ee.log`
   * @member {Logger}
   * @since 1.0.0
   */
  get logger() {
    return this.getLogger('logger');
  }

  /**
   * core logger for framework and plugins, log file is `$HOME/logs/ee-core.log`
   * @member {Logger}
   * @since 1.0.0
   */
  get coreLogger() {
    return this.getLogger('coreLogger');
  }
  
  /**
   * @class curl
   * @since 1.0.0
   */
  curl(url, opts) {
    return this.httpclient.request(url, opts);
  }

  /**
   * HttpClient instance
   * @see https://github.com/node-modules/urllib
   * @member {HttpClient}
   */
  get httpclient() {
    if (!this[HTTPCLIENT]) {
      this[HTTPCLIENT] = new this.HttpClient(this.config.httpclient);
    }
    return this[HTTPCLIENT];
  }

  /**
   * core app have been loaded
   */
  async ready () {
    // do some things
  }
}

module.exports = BaseApp;