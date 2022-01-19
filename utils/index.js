'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

exports = module.exports;

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
 * egg使用 - 获取数据存储路径
 */
 exports.getStorageDir = function() {
  const pkgJson = this.getPackage();
  const userHomeDir = os.userInfo().homedir;
  const storageDir = path.join(userHomeDir, pkgJson.name, '/');

  return storageDir;
}