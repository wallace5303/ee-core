
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');

/**
 * 获取数据存储路径
 */
exports.getStorageDir = function () {
  let env = process.env.EE_SERVER_ENV;
  const appDir = env === 'local' || env === 'unittest' ? process.env.EE_HOME : process.env.EE_APP_USER_DATA;
  const storageDir = path.join(appDir, 'data');
  return storageDir;
}

/**
 * 创建文件夹
 */
exports.mkdir = function(filepath) {
  mkdirp.sync(path.dirname(filepath));
  return
}

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