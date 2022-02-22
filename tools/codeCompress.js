'use strict';

const path = require('path');
const fs = require('fs');
const fsPro = require('fs-extra');
const UglifyJS = require('uglify-js');

class CodeCompress {
  constructor() {
    const directory = [
      'app',
      'electron',
      'config'
    ];
    this.dirs = [];

    this.basePath = process.cwd();
    this.backupCodeDir = path.join(this.basePath, 'run', 'backup_code');

    // 检查存在的目录
    for (let i = 0; i < directory.length; i++) {
      let codeDirPath = path.join(this.basePath, directory[i]);
      if (fs.existsSync(codeDirPath)) {
        this.dirs.push(directory[i]);
      }
    }
    console.log('dirs:', this.dirs);
  }

  /**
   * 备份 app、electron目录代码
   */
  backup () {
    console.log('[ee-core] [code_compress] [backup] start');
    this.rmBackup();

    for (let i = 0; i < this.dirs.length; i++) {
      // check code dir
      let codeDirPath = path.join(this.basePath, this.dirs[i]);
      if (!fs.existsSync(codeDirPath)) {
        console.log('[ee-core] [code_compress] [backup] ERROR: %s is not exist', codeDirPath);
        return
      }

      // copy
      let targetDir = path.join(this.backupCodeDir, this.dirs[i]);
      console.log('[ee-core] [code_compress] [backup] targetDir:', targetDir);
      if (!fs.existsSync(targetDir)) {
        this.mkdir(targetDir);
        this.chmodPath(targetDir, '777');
      }

      fsPro.copySync(codeDirPath, targetDir);
    }
    console.log('[ee-core] [code_compress] [backup] success');
  }

  /**
   * 还原代码
   */
  restore () {
    console.log('[ee-core] [code_compress] [restore] start');
    for (let i = 0; i < this.dirs.length; i++) {
      let codeDirPath = path.join(this.backupCodeDir, this.dirs[i]);
      let targetDir = path.join(this.basePath, this.dirs[i]);
      fsPro.copySync(codeDirPath, targetDir);
    }
    console.log('[ee-core] [code_compress] [restore] success');
  };

  /**
   * 压缩代码
   */
  compress () {
    console.log('[ee-core] [code_compress] [compress] start');
    for (let i = 0; i < this.dirs.length; i++) {
      let codeDirPath = path.join(this.basePath, this.dirs[i]);
      this.compressLoop(codeDirPath);
    }
    console.log('[ee-core] [code_compress] [compress] success');
  };

  compressLoop (dirPath) {
    let files = [];
    if (fs.existsSync(dirPath)) {
      files = fs.readdirSync(dirPath);
      files.forEach((file, index) => {
        let curPath = dirPath + '/' + file;        
        if (fs.statSync(curPath).isDirectory()) {
          this.compressLoop(curPath);
        } else {
          if (path.extname(curPath) === '.js') {
            this.miniFile(curPath);
          }
        }
      });
    }
  }

  miniFile (file) {
    let code = fs.readFileSync(file, "utf8");
    const options = {
      mangle: {
        toplevel: false,
      },
    };
    
    let result = UglifyJS.minify(code, options);
    fs.writeFileSync(file, result.code, "utf8"); 
  }

  /**
   * 格式化参数
   */
  formatArgvs () {
    // argv
    let argvs = [];
    for (let i = 0; i < process.argv.length; i++) {
      const tmpArgv = process.argv[i]
      if (tmpArgv.indexOf('--') !== -1) {
        argvs.push(tmpArgv.substring(2))
      }
    }
    return argvs;
  }

  /**
   * 移除备份
   */
  rmBackup () {
    fs.rmdirSync(this.backupCodeDir, {recursive: true});
    return;
  }

  /**
   * 检查文件是否存在
   */
  fileExist (filePath) {
    try {
      return fs.statSync(filePath).isFile();
    } catch (err) {
      return false;
    }
  };

  mkdir (dirpath, dirname) {
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

  chmodPath (path, mode) {
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
}

const compress = () => {
  const cc = new CodeCompress();
  cc.backup();
  cc.compress();
}

const restore = () => {
  const cc = new CodeCompress();
  cc.restore();
}

module.exports = {
  compress,
  restore
};



