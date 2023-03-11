/**
 * 该模块不在增加新功能，请使用 /module/utils/index 模块
 */

const path = require('path');
const UtilsJson = require('../utils/json');
const UtilsPs = require('../ps');
const UtilsHelper = require('../utils/helper');
const Copy = require('../utils/copyto');
const Conf = require('../config');
const Channel = require('../const/channel');

/**
 * other module
 */
Copy(UtilsPs)
.and(UtilsHelper)
.to(exports);

/**
 * 获取项目根目录package.json
 */
exports.getPackage = function() {
  const json = UtilsJson.readSync(path.join(this.getHomeDir(), 'package.json'));
  
  return json;
};

/**
 * 获取 ee配置
 */
exports.getEeConfig = function() {
  const config = Conf.all();

  return config;
}

/**
 * 获取 app version
 */
exports.getAppVersion = function() {
  const v = Conf.all().appVersion;
  return v;
}

/**
 * 获取 插件配置
 */
exports.getAddonConfig = function() {
  const cfg = Conf.all().addons;
  return cfg;
}

/**
 * 获取 mainServer配置
 */
exports.getMainServerConfig = function() {
  const cfg = Conf.all().mainServer;
  return cfg;
}

/**
 * 获取 httpServer配置
 */
exports.getHttpServerConfig = function() {
  const cfg = Conf.all().httpServer;
  return cfg;
}

/**
 * 获取 socketServer配置
 */
exports.getSocketServerConfig = function() {
  const cfg = Conf.all().socketServer;
  return cfg;
}

/**
 * 获取 socketio port
 */
exports.getSocketPort = function() {
  const port = Conf.all().socketServer.port;
  return parseInt(port);
}

/**
 * 获取 socket channel
 */
exports.getSocketChannel = function() {
  return Channel.socketIo.partySoftware;
}
