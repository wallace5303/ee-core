const Logger = require('./logger');
const EELoggers = Symbol('EeApplication#EELoggers');

const Log = {
  /**
   * 创建日志实例
   */
  create (config) {
    const eeLog = Logger.create(config);

    return eeLog;
  },

  /**
   * logger
   */
  get logger() {
    if (!this[EELoggers]) {
      this[EELoggers] = Logger.create();
    }

    return this[EELoggers]['logger'] || null;
  },

  /**
   * coreLogger
   */
  get coreLogger () {
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