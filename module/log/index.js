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

};

module.exports = Log;