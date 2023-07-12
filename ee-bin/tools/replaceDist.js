'use strict';

const path = require('path');
const fs = require('fs');
const fsPro = require('fs-extra');
const chalk = require('chalk');

/**
 * 资源替换
 */

 module.exports = {
  
  /**
   * 执行
   */  
  run(options = {}) {
    console.log('[ee-bin] [rd] Start moving resources');
    const homeDir = process.cwd();

    // argv
    const distDir = options.distDir;
    const sourceDir = path.join(homeDir, distDir);
    const sourceIndexFile = path.join(sourceDir, 'index.html');
    
    if (!this._fileExist(sourceIndexFile)) {
      console.info(sourceIndexFile);
      const errorTips = chalk.bgRed('Error') + ' Frontend resource does not exist, please build !';
      console.error(errorTips);
      return
    }
    
    // 清空历史资源 并 复制到ee资源目录
    const eeResourceDir = path.join(homeDir, 'public', 'dist');
    if (!fs.existsSync(eeResourceDir)) {
      fs.mkdirSync(eeResourceDir, {recursive: true, mode: 0o777});
    }
    this._rmFolder(eeResourceDir);
    console.log('[ee-bin] [rd] Clear history resources:', eeResourceDir);

    fsPro.copySync(sourceDir, eeResourceDir);
    console.log('[ee-bin] [rd] Copy a resource to:', eeResourceDir);
    console.log('[ee-bin] [rd] End');
  },

  _fileExist(filePath) {
    try {
      return fs.statSync(filePath).isFile();
    } catch (err) {
      // const errorTips = chalk.bgRed('Error') + ' [ee-bin] [rd] ';
      // console.error(errorTips, err);
      return false;
    }
  },

  /**
   * 删除文件夹
   */
  _rmFolder(folder) {
    const nodeVersion = (process.versions && process.versions.node) || null;
    if (nodeVersion && this._compareVersion(nodeVersion, '14.14.0') == 1) {
      fs.rmSync(folder, {recursive: true});
    } else {
      fs.rmdirSync(folder, {recursive: true});
    }
  },

  /**
   * 版本号比较
   */
  _compareVersion(v1, v2) {
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
}