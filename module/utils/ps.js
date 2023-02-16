const path = require('path');

/**
 * 当前环境 - local | prod
 */
exports.env = function() {
  return process.env.EE_SERVER_ENV;
}

/**
 * 是否为开发环境
 */
exports.isDev = function() {
  if ( process.env.EE_SERVER_ENV === 'development' ||
    process.env.EE_SERVER_ENV === 'dev' ||
    process.env.EE_SERVER_ENV === 'local'
  ) {
    return true;
  }
  
  if ( process.env.NODE_ENV === 'development' ||
    process.env.NODE_ENV === 'dev' ||
    process.env.NODE_ENV === 'local'
  ) {
    return true;
  }

  return false;
};

/**
 * 是否为渲染进程
 */
exports.isRenderer = function() {
  return (typeof process === 'undefined' ||
    !process ||
    process.type === 'renderer');
};

/**
 * 是否为主进程
 */
exports.isMain = function() {
  return ( typeof process !== 'undefined' &&
    process.type === 'browser');
};

/**
 * 是否为node子进程
 */
exports.isForkedChild = function() {
  return (Number(process.env.ELECTRON_RUN_AS_NODE) === 1);
};

/**
 * 获取数据存储路径
 */
exports.getStorageDir = function () {
  const storageDir = path.join(this.getRootDir(), 'data');
  return storageDir;
}

/**
 * 获取日志存储路径
 */
exports.getLogsDir = function () {
  const dir = path.join(this.getRootDir(), 'logs');
  return dir;
}

/**
 * 获取root目录
 */
exports.getRootDir = function () {
  const appDir = this.isDev() ? process.env.EE_HOME : process.env.EE_APP_USER_DATA;
  return appDir;
}