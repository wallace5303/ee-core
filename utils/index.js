'use strict';

const fs = require('fs');
const path = require('path');

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
 * @class 获取 coredb
 * @since 1.0.0
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
  let env = process.env.EE_SERVER_ENV;
  const dir = env === 'local' || env === 'unittest' ? process.env.EE_HOME : process.env.EE_APP_USER_DATA;
  return dir;
}

/**
 * 获取 日志目录
 */
exports.getLogDir = function() {
  let logPath = path.join(this.getAppUserDataDir(), 'logs');
  return logPath;
}

/**
 * 获取 socketio port
 */
exports.getIpcPort = function() {
  return process.env.EE_IPC_PORT;
}