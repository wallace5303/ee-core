'use strict';

const path = require('path');
const fs = require('fs');
const fsPro = require('fs-extra');
const is = require('is-type-of');
const UglifyJS = require('uglify-js');
const bytenode = require('bytenode');

class Encrypt {
  constructor() {
    this.basePath = process.cwd();
    const directory = [
      'electron',
    ];
    this.dirs = [];
    this.type = '';
    this.configPath = '';
    this.config = null;
    this.filesExt = ['.js', '.json', '.node'];
    this.encryptCodeDir = path.join(this.basePath, 'public');

    // argv
    for (let i = 0; i < process.argv.length; i++) {
      let tmpArgv = process.argv[i];
      if (tmpArgv.indexOf('--type=') !== -1) {
        this.type = tmpArgv.substring(7);
      }
      if (tmpArgv.indexOf('--config=') !== -1) {
        let configPathStr = tmpArgv.substring(9);
        this.configPath = path.join(this.basePath, configPathStr);
        this.config = fs.existsSync(this.configPath) ? require(this.configPath) : null;
      }
    }

    // 检查存在的目录
    for (let i = 0; i < directory.length; i++) {
      let codeDirPath = path.join(this.basePath, directory[i]);
      if (fs.existsSync(codeDirPath)) {
        this.dirs.push(directory[i]);
      }
    }
    console.log('[ee-core] [encrypt] dirs:', this.dirs);
  }

  /**
   * 检查
   */
  check () {
    if (this.configPath.length > 0 && !is.object(this.config)) {
      console.log('[ee-core] [encrypt] ERROR: config file is invalid');
      return false;
    }
    return true;
  }

  /**
   * 备份 electron 目录代码
   */
  backup () {
    console.log('[ee-core] [encrypt] backup start');

    for (let i = 0; i < this.dirs.length; i++) {
      // check code dir
      let codeDirPath = path.join(this.basePath, this.dirs[i]);
      if (!fs.existsSync(codeDirPath)) {
        console.log('[ee-core] [encrypt] ERROR: backup %s is not exist', codeDirPath);
        return
      }

      let targetDir = path.join(this.encryptCodeDir, this.dirs[i]);

      // remove old
      this.rmBackup(targetDir);

      // copy
      console.log('[ee-core] [encrypt] backup target Dir:', targetDir);
      if (!fs.existsSync(targetDir)) {
        this.mkdir(targetDir);
        this.chmodPath(targetDir, '777');
      }

      fsPro.copySync(codeDirPath, targetDir);
    }
    console.log('[ee-core] [encrypt] backup end');
    return true;
  }

  /**
   * 加密代码
   */
  encrypt () {
    console.log('[ee-core] [encrypt] start ciphering');
    for (let i = 0; i < this.dirs.length; i++) {
      let codeDirPath = path.join(this.encryptCodeDir, this.dirs[i]);
      this.loop(codeDirPath);
    }

    console.log('[ee-core] [encrypt] end ciphering');
  };

  /**
   * 递归
   */
  loop (dirPath) {
    let files = [];
    if (fs.existsSync(dirPath)) {
      files = fs.readdirSync(dirPath);
      files.forEach((file, index) => {
        let curPath = dirPath + '/' + file;        
        if (fs.statSync(curPath).isDirectory()) {
          this.loop(curPath);
        } else {
          const extname = path.extname(curPath);
          if (this.filesExt.indexOf(extname) !== -1) {
            this.generate(curPath);
          }
        }
      });
    }
  }

  /**
   * 生成文件
   */  
  generate (curPath) {
    if (this.type == 'bytecode') {
      this.generateBytecodeFile(curPath);
    } else {
      this.generateConfuseFile(curPath);
    }
  }

  /**
   * 生成压缩/混淆文件
   */  
  generateConfuseFile (file) {
    let defaultOpt = {
      mangle: {
        toplevel: false,
      },
      compress: {
        drop_console: true,
        passes: 2
      },
      output: {
        beautify: false
      },
    }
    let options = defaultOpt;
    if (is.object(this.config)) {
      options = Object.assign(defaultOpt, this.config);
    }

    let code = fs.readFileSync(file, "utf8");
    let result = UglifyJS.minify(code, options);
    fs.writeFileSync(file, result.code, "utf8"); 
  }

  /**
   * 生成字节码文件
   */
  generateBytecodeFile (curPath) {
    if (path.extname(curPath) !== '.js') {
      return
    }
    //let jscFile = curPath.replace(/.js/g, '.jsc');
    let jscFile = curPath + 'c';
    bytenode.compileFile({
      filename: curPath,
      output: jscFile,
    });
    fs.rmSync(curPath, {force: true});
  }

  /**
   * 移除备份
   */
  rmBackup (dir) {
    if (fs.existsSync(dir)) {
      console.log('[ee-core] [encrypt] clean old directory:', dir);
      fs.rmSync(dir, {recursive: true, force: true});
    }
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

const run = () => {
  const e = new Encrypt();
  if (!e.check()) return;
  if (!e.backup()) return;
  e.encrypt();
}

module.exports = {
  run
};