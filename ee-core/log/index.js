const dayjs = require('dayjs');
const Logger = require('./logger');
const EELoggers = Symbol('ee-core#EELoggers');

class EELog {

  constructor() {
    this.logDate = 0;
    this[EELoggers] = null;
  }

  // 初始化日志实例
  init(config) {
    this._delCache();
    this[EELoggers] = Logger.create(config);

    return this[EELoggers];
  }

  // 创建日志实例
  create(config) {
    this._delCache();
    const eeLog = Logger.create(config);

    return eeLog;
  }

  _delCache() {
    const now = parseInt(dayjs().format('YYYYMMDD'));
    if (this.logDate != now) {
      this.logDate = now;
      this[EELoggers] = null;
    }
  }

  get logger() {
    this._delCache();

    return this[EELoggers]['logger'] || null;
  }

  get coreLogger () {
    this._delCache();

    return this[EELoggers]['coreLogger'] || null;
  }

};

const eelog = new EELog();
const coreLogger = eelog.coreLogger;
const logger = eelog.logger;

module.exports = {
  logger,
  coreLogger,
};