const dayjs = require('dayjs');
const Logger = require('./logger');

const Instance = {
  eelog: null,
};

let logDate = 0;

// 创建日志实例
function createLog(config) {
  _delCache();
  const eeLog = Logger.create(config);

  return eeLog;
}

function loadLog() {
  Instance["eelog"] = createLog();
  return Instance["eelog"];
}

function getLogger() {
  _delCache();
  if (!Instance["eelog"]) {
    loadLog();
  }
  return Instance["eelog"]["logger"];
}

function getCoreLogger() {
  _delCache();
  if (!Instance["eelog"]) {
    loadLog();
  }
  return Instance["eelog"]["coreLogger"];
}

function _delCache() {
  const now = parseInt(dayjs().format('YYYYMMDD'));
  if (logDate != now) {
    logDate = now;
    Instance["eelog"] = null;
  }
}

module.exports = {
  createLog,
  loadLog,
  get logger() {
    return getLogger();
  },
  get coreLogger() {
    return getCoreLogger();
  },
};