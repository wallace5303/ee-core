const path = require('path');
const convert = require('koa-convert');
const is = require('is-type-of');
const co = require('co');
const eis = require('electron-is');
const Storage = require('../storage');
const Constants = require('../const');
const Ps = require('./ps');
const Helper = require('./helper');
const UtilsJson = require('./json');

/**
 * other module
 */
copy(Ps)
.and(Helper)
.to(exports);

/**
 * 获取项目根目录package.json
 */
exports.getPackage = function() {
  const json = UtilsJson.readSync(path.join(this.getHomeDir(), 'package.json'));
  
  return json;
};

/**
 * 获取 coredb
 */
exports.getCoreDB = function() {
  const coreDB = Storage.connection('system');
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
 * 获取 app version
 */
exports.getAppVersion = function() {
  const cdb = this.getCoreDB();
  const v = cdb.getItem('config').appVersion;
  return v;
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
  return Constants.socketIo.channel;
}

/**
 * 获取 额外资源目录
 */
exports.getExtraResourcesDir = function() {
  const execDir = this.getExecDir();

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


