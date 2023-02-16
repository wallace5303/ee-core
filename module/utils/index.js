const path = require('path');
const constant = require('../const');
const convert = require('koa-convert');
const is = require('is-type-of');
const co = require('co');
const eis = require('electron-is');
const utilsJson = require('./json');
const interUtils = require('./internal');
const storage = require('../storage');
const Ps = require('./ps');

// internal utils apis
exports.isDev = interUtils.isDev;
exports.isRenderer = interUtils.isRenderer;
exports.isMain = interUtils.isMain;
exports.isForkedChild = interUtils.isForkedChild;
exports.mkdir = interUtils.mkdir;
exports.chmodPath = interUtils.chmodPath;
exports.compareVersion = interUtils.compareVersion;
exports.getEnv = interUtils.getEnv;
exports.getBaseDir = interUtils.getBaseDir;

/**
 * 获取项目根目录package.json
 */
exports.getPackage = function() {
  const cdb = this.getCoreDB();
  const config = cdb.getItem('config');
  const json = utilsJson.readSync(path.join(config.homeDir, 'package.json'));
  
  return json;
};

/**
 * 获取 coredb
 */
exports.getCoreDB = function() {
  const coreDB = storage.connection('system');
  return coreDB;
}

/**
 * 获取 ee配置
 */
exports.getEeConfig = function() {
  const cdb = this.getCoreDB();
  const config = cdb.getItem('config');

  return config;
}

/**
 * 获取 root 目录 (开发环境时，为项目根目录)
 */
exports.getRootDir = function() {
  const cdb = this.getCoreDB();
  const config = cdb.getItem('config');
  const dir = Ps.isDev() ? config.homeDir : config.appUserDataDir;
  return dir;
}

/**
 * 获取 日志目录
 */
exports.getLogDir = function() {
  const cdb = this.getCoreDB();
  const logPath = cdb.getItem('config').logger.dir;
  return logPath;
}

/**
 * 获取 home目录
 */
exports.getHomeDir = function() {
  const cdb = this.getCoreDB();
  const homePath = cdb.getItem('config').homeDir;
  return homePath;
}

/**
 * 获取 root目录
 */
exports.getRootDir = function() {
  const cdb = this.getCoreDB();
  const rootPath = cdb.getItem('config').root;
  return rootPath;
}

/**
 * 获取 appUserData目录
 */
exports.getAppUserDataDir = function() {
  const cdb = this.getCoreDB();
  const dataPath = cdb.getItem('config').appUserDataDir;
  return dataPath;
}

/**
 * 获取 app version
 */
exports.getAppVersion = function() {
  const cdb = this.getCoreDB();
  const v = cdb.getItem('config').appVersion;
  return v;
}

/**
 * 获取 exec目录
 */
exports.getExecDir = function() {
  const cdb = this.getCoreDB();
  const execPath = cdb.getItem('config').execDir;
  return execPath;
}

/**
 * 获取 插件配置
 */
exports.getAddonConfig = function() {
  const cdb = this.getCoreDB();
  const cfg = cdb.getItem('config').addons;
  return cfg;
}

/**
 * 获取 mainServer配置
 */
exports.getMainServerConfig = function() {
  const cdb = this.getCoreDB();
  const cfg = cdb.getItem('config').mainServer;
  return cfg;
}

/**
 * 获取 httpServer配置
 */
exports.getHttpServerConfig = function() {
  const cdb = this.getCoreDB();
  const cfg = cdb.getItem('config').httpServer;
  return cfg;
}

/**
 * 获取 socketServer配置
 */
exports.getSocketServerConfig = function() {
  const cdb = this.getCoreDB();
  const cfg = cdb.getItem('config').socketServer;
  return cfg;
}

/**
 * 获取 socketio port
 */
exports.getSocketPort = function() {
  const cdb = this.getCoreDB();
  const port = cdb.getItem('config').socketServer.port;
  return parseInt(port);
}

/**
 * 获取 socket channel
 */
exports.getSocketChannel = function() {
  return constant.socketIo.channel;
}

/**
 * 获取 额外资源目录
 */
exports.getExtraResourcesDir = function() {
  const cdb = this.getCoreDB();
  const config = cdb.getItem('config');
  const execDir = config.execDir;

  // 资源路径不同
  let dir = '';
  if (config.isPackaged) {
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
 * 执行一个函数
 */
exports.callFn = async function (fn, args, ctx) {
  args = args || [];
  if (!is.function(fn)) return;
  if (is.generatorFunction(fn)) fn = co.wrap(fn);
  return ctx ? fn.call(ctx, ...args) : fn(...args);
}

exports.middleware = function (fn) {
  return is.generatorFunction(fn) ? convert(fn) : fn;
}


