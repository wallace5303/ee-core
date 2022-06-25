'use strict';

const fs = require('fs');
const path = require('path');
const constant = require('../lib/constant');
const convert = require('koa-convert');
const is = require('is-type-of');
const co = require('co');
const utility = require('utility');
const eis = require('electron-is');

/**
 * 创建文件夹
 */
exports.mkdir = function(dirpath, dirname) {
  // 判断是否是第一次调用
  if (typeof dirname === 'undefined') {
    if (fs.existsSync(dirpath)) {
      return;
    }
    this.mkdir(dirpath, path.dirname(dirpath));
  } else {
    // 判断第二个参数是否正常，避免调用时传入错误参数
    if (dirname !== path.dirname(dirpath)) {
      this.mkdir(dirpath);
      return;
    }
    if (fs.existsSync(dirname)) {
      fs.mkdirSync(dirpath);
    } else {
      this.mkdir(dirname, path.dirname(dirname));
      fs.mkdirSync(dirpath);
    }
  }
};

/**
 * 修改文件权限
 */
exports.chmodPath = function(path, mode) {
  let files = [];
  if (fs.existsSync(path)) {
    files = fs.readdirSync(path);
    files.forEach((file, index) => {
      const curPath = path + '/' + file;
      if (fs.statSync(curPath).isDirectory()) {
        this.chmodPath(curPath, mode); // 递归删除文件夹
      } else {
        fs.chmodSync(curPath, mode);
      }
    });
    fs.chmodSync(path, mode);
  }
};


/**
 * 获取项目根目录package.json
 */
exports.getPackage = function() {
  const cdb = this.getCoreDB();
  const config = cdb.getItem('config');
  const json = utility.readJSONSync(path.join(config.homeDir, 'package.json'));
  
  return json;
};

/**
 * 获取 coredb
 */
exports.getCoreDB = function() {
  const coreDB = require('../lib/storage/index').JsonDB.connection('system');
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
 * 获取 egg配置
 */
exports.getEggConfig = function() {
  const cdb = this.getCoreDB();
  const config = cdb.getItem('config');

  return config.egg;
}

/**
 * 获取 数据库存储路径
 */
exports.getStorageDir = function() {
  const cdb = this.getCoreDB();
  const dirPath = cdb.getStorageDir();

  return dirPath;
}

/**
 * 获取 应用程序数据目录 (开发环境时，为项目根目录)
 */
exports.getAppUserDataDir = function() {
  const cdb = this.getCoreDB();
  const config = cdb.getItem('config');
  const env = config.env;
  const dir = env === 'local' || env === 'unittest' ? config.homeDir : config.appUserDataDir;
  return dir;
}

/**
 * 获取 日志目录
 */
exports.getLogDir = function() {
  const logPath = path.join(this.getAppUserDataDir(), 'logs');
  return logPath;
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

/**
 * 版本号比较
 */
exports.compareVersion = function (v1, v2) {
  v1 = v1.split('.')
  v2 = v2.split('.')
  const len = Math.max(v1.length, v2.length)

  while (v1.length < len) {
    v1.push('0')
  }
  while (v2.length < len) {
    v2.push('0')
  }
  
  for (let i = 0; i < len; i++) {
    const num1 = parseInt(v1[i])
    const num2 = parseInt(v2[i])

    if (num1 > num2) {
      return 1
    } else if (num1 < num2) {
      return -1
    }
  }

  return 0
}

