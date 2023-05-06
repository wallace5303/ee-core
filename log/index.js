const dayjs = require('dayjs');
const Logger = require('./logger');
const EELoggers = Symbol('EeApplication#EELoggers');
let LogDate = 0;

const Log = {
  /**
   * 创建日志实例
   */
  create(config) {
    this._delCache();
    const eeLog = Logger.create(config);

    return eeLog;
  },

  /**
   * delete cache
   */
  _delCache() {
    let now = parseInt(dayjs().format('YYYYMMDD'));
    if (LogDate != now) {
      LogDate = now;
      this[EELoggers] = null;
    }
  },

  /**
   * logger
   */
  get logger() {
    this._delCache();
    if (!this[EELoggers]) {
      this[EELoggers] = Logger.create();
    }

    return this[EELoggers]['logger'] || null;
  },

  /**
   * coreLogger
   */
  get coreLogger () {
    this._delCache();
    if (!this[EELoggers]) {
      this[EELoggers] = Logger.create();
    }

    return this[EELoggers]['coreLogger'] || null;
  },

  get error() {
    return this.logger.error.bind(this.logger);
  },

  get warn() {
    return this.logger.warn.bind(this.logger);
  },

  get info() {
    return this.logger.info.bind(this.logger);
  },

  get debug() {
    return this.logger.debug.bind(this.logger);
  },
};

module.exports = Log;