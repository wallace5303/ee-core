'use strict';

const path = require('path');
const fs = require('fs');
const fsPro = require('fs-extra');

/**
 * 资源替换
 */

 module.exports = {
  
  /**
   * 执行
   */  
  run () {
    console.log('[ee-core] [replace_dist] 开始移动资源');
    const homeDir = process.cwd();

    // argv
    let distDir = '';
    for (let i = 0; i < process.argv.length; i++) {
      let tmpArgv = process.argv[i]
      if (tmpArgv.indexOf('--dist_dir=') !== -1) {
        distDir = tmpArgv.substring(11)
      }
    }
 
    const fileExist = (filePath) => {
      try {
        return fs.statSync(filePath).isFile();
      } catch (err) {
        console.error('[ee-core] [replace_dist] ERROR ', err);
        return false;
      }
    };
    
    const sourceDir = path.join(homeDir, distDir);
    const sourceIndexFile = path.join(sourceDir, 'index.html');
    
    if (!fileExist(sourceIndexFile)) {
      console.error('[ee-core] [replace_dist] ERROR 前端资源不存在，请构建!!!');
      return
    }
    
    // 复制到ee资源目录
    const eeResourceDir = path.join(homeDir, 'public', 'dist');

    // 清空历史资源
    fs.rmdirSync(eeResourceDir, {recursive: true});
    console.log('[ee-core] [replace_dist] 清空历史资源:', eeResourceDir);

    fsPro.copySync(sourceDir, eeResourceDir);
    console.log('[ee-core] [replace_dist] 复制资源到:', eeResourceDir);

    console.log('[ee-core] [replace_dist] 结束');
  }
}



