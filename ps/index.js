const path = require('path');
const eis = require('../utils/is');
const Log = require('../log');

/**
 * 当前进程的所有env
 */
exports.allEnv = function() {
  return process.env;
}

/**
 * 当前环境 - local | prod
 */
exports.env = function() {
  return process.env.EE_SERVER_ENV;
}

/**
 * 获取 当前环境
 */
exports.getEnv = this.env

/**
 * 是否生产环境
 */
exports.isProd = function() {
  return (process.env.EE_SERVER_ENV === 'prod');
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
 * 当前进程类型
 */
exports.processType = function() {
  let type = '';
  if (this.isMain()) {
    type = 'browser';
  } else if (this.isRenderer()) {
    type = 'renderer';
  } else if (this.isForkedChild()) {
    type = 'child';
  }

  return type;
};

/**
 * 获取home路径
 */
exports.getHomeDir = function () {
  return process.env.EE_HOME;
}

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
exports.getLogDir = function () {
  const dir = path.join(this.getRootDir(), 'logs');
  return dir;
}

/**
 * 获取root目录  (dev-项目根目录，pro-app user data目录)
 */
exports.getRootDir = function () {
  const appDir = this.isDev() ? process.env.EE_HOME : process.env.EE_APP_USER_DATA;
  return appDir;
}

/**
 * 获取base目录
 */
exports.getBaseDir = function() {
  return process.env.EE_BASE_DIR;
}

/**
 * 获取electron目录
 */
exports.getElectronDir = function() {
  return process.env.EE_BASE_DIR;
}

/**
 * 获取 额外资源目录
 */
exports.getExtraResourcesDir = function() {
  const execDir = this.getExecDir();
  const isPackaged = this.isPackaged();


  // 资源路径不同
  let dir = '';
  if (isPackaged) {
    // 打包后  execDir为 应用程序 exe\dmg\dep软件所在目录；打包前该值是项目根目录
    // windows和MacOs不一样
    dir = path.join(execDir, "resources", "extraResources");
    if (eis.macOS()) {
      dir = path.join(execDir, "..", "Resources", "extraResources");
    }
  } else {
    // 打包前
    dir = path.join(execDir, "build", "extraResources");
  }
  return dir;
}

/**
 * 获取 appUserData目录
 */
exports.getAppUserDataDir = function() {
  return process.env.EE_APP_USER_DATA;
}

/**
 * 获取 exec目录
 */
exports.getExecDir = function() {
  return process.env.EE_EXEC_DIR;
}

/**
 * 获取操作系统用户目录
 */
exports.getUserHomeDir = function () {
  return process.env.EE_USER_HOME;
}

/**
 * 获取主进程端口
 */
exports.getMainPort = function () {
  return parseInt(process.env.EE_MAIN_PORT) || 0;
}

/**
 * 获取内置socket端口
 */
exports.getSocketPort = function () {
  return parseInt(process.env.EE_SOCKET_PORT) || 0;
}

/**
 * 获取内置http端口
 */
exports.getHttpPort = function () {
  return parseInt(process.env.EE_HTTP_PORT) || 0;
}

/**
 * 是否打包
 */
exports.isPackaged = function () {
  return process.env.EE_IS_PACKAGED === 'true';
}

/**
 * 是否加密
 */
exports.isEncrypted = function () {
  return process.env.EE_IS_ENCRYPTED === 'true';
}

/**
 * 是否热重启
 */
exports.isHotReload = function () {
  return process.env.HOT_RELOAD === 'true';
}

/**
 * 进程退出
 */
exports.exit = function(code = 0) {
  return process.exit(code);
}

/**
 * 格式化message
 */
exports.makeMessage = function(msg = {}) {
  let message = Object.assign({
    channel: '',
    event: '', 
    data: {}
  }, msg);

  return message;
}

/**
 * 退出ChildJob进程
 */
exports.exitChildJob = function(code = 0) {
  try {
    let args = JSON.parse(process.argv[2]);
    if (args.type == 'childJob') {
      //Log.coreLogger.info('------------ exit ChildJob ');
      process.exit(code);
    }
  } catch (e) {
    //Log.coreLogger.error('------------ error exit ChildJob ');
    process.exit(code);
  }
}