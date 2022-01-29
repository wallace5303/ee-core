'use strict';

const fs = require('fs');
const path = require('path');
const LowdbStorage = require('../lib/storage/lowdbStorage');

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
 * 获取数据存储路径
 */
exports.getStorageDir = function() {
  let env = process.env.EE_SERVER_ENV;
  const appDir = env === 'local' || env === 'unittest' ? process.env.EE_HOME : process.env.EE_APP_USER_DATA;
  const storageDir = path.join(appDir, 'data');
  return storageDir;
}

/**
 * 获取ee配置
 */
exports.getEeConfig = function() {
  const storage = this.getStorage();
  const config = storage.getItem('config');

  return config;
}

/**
 * 获取egg配置
 */
 exports.getEggConfig = function() {
  const storage = this.getStorage();
  const config = storage.getItem('config');

  return config.egg;
}

/**
 * 获取ee storage
 */
exports.getStorage = function() {
  const storage = new LowdbStorage('system');
  return storage;
}

/**
 * 获取 storage 目录
 */
exports.getStorageDir = function() {
  const storage = this.getStorage();
  const dirPath = storage.getStorageDir();

  return dirPath;
}

/**
 * 获取 日志 目录
 */
exports.getLogDir = function() {
  let logPath = path.join(this.getStorageDir(), 'logs');
  return logPath;
}