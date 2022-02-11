'use strict';

const fs = require('fs');
const path = require('path');
const constant = require('../lib/constant');
const convert = require('koa-convert');
const is = require('is-type-of');
const co = require('co');

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
  const filePath = path.join(process.cwd(), 'package.json');
  const json = require(filePath);
  
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
exports.getIpcPort = function() {
  const cdb = this.getCoreDB();
  const port = cdb.getItem('ipc_port');
  return port;
}

/**
 * 获取 ipc channel
 */
exports.getIpcChannel = function() {
  return constant.socketIo.channel;
}

exports.callFn = async function (fn, args, ctx) {
  args = args || [];
  if (!is.function(fn)) return;
  if (is.generatorFunction(fn)) fn = co.wrap(fn);
  return ctx ? fn.call(ctx, ...args) : fn(...args);
}

exports.middleware = function (fn) {
  return is.generatorFunction(fn) ? convert(fn) : fn;
}

// exports.call = async function (method, uri, params, timeout = 15000) {

//   try {
//     const port = this.app.config.egg.port;
//     const url = "http://127.0.0.1:" + port + uri;
//     console.log('[ee:socket] [call]: info url:', url);
//     const response = await this.app.curl(url, {
//       method: method,
//       contentType: 'application/json',
//       data: params,
//       dataType: 'json',
//       timeout: timeout,
//     });
//     const result = response.data;
//     console.log('[ee:socket] [call]: info result:%j', result);

//   } catch (err) {
//     this.app.logger.error('[ee:socket] [call] throw error:', err);
//   }

//   return result; 
// }