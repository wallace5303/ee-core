const dayjs = require('dayjs');
const Logger = require('./logger');
const EELoggers = Symbol('ee-core#EELoggers');

const Cache = {
  log: null,
};

class EELog {

  constructor() {
    this.logDate = 0;
    this[EELoggers] = null;
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

function loadLogger() {
  const eeLog = new EELog();
  
  Cache["config"] = eeLog.create();
  return Cache["config"];
}

function getConfig() {
  if (!Cache["config"]) {
    Cache["config"] = loadConfig();
  };
  return Cache["config"];
}

const eelog = new EELog();
const coreLogger = eelog.coreLogger;
const logger = eelog.logger;

module.exports = {
  EELog,
  logger,
  coreLogger,
};