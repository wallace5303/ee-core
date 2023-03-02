const path = require('path');
const Storage = require('../storage');
const Constants = require('../const');
const Ps = require('../ps');
const UtilsJson = require('./json');

/**
 * 获取项目根目录package.json
 */
exports.getPackage = function() {
  const json = UtilsJson.readSync(path.join(Ps.getHomeDir(), 'package.json'));
  
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
 * 获取 socket channel
 */
exports.getSocketChannel = function() {
  return Constants.socketIo.channel;
}


