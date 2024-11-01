'use strict';

const path = require('path');
const fs = require('fs');
const fsPro = require('fs-extra');
const is = require('is-type-of');
const bytenode = require('bytenode');
const crypto = require('crypto');
const JavaScriptObfuscator = require('javascript-obfuscator');
const globby = require('globby');
const chalk = require('chalk');
const Utils = require('../lib/utils');

class Encrypt {
  constructor(options = {}) {
    // cli args
    const outputFolder = options.out || './public';
    const configFile = options.config || './electron/config/bin.js';

    this.basePath = process.cwd();
    this.encryptCodeDir = path.join(this.basePath, outputFolder);

    // 先从 bin config获取，没有的话从 config/encrypt.js
    const hasConfig = Utils.checkConfig(configFile);
    if (hasConfig) {
      const cfg = Utils.loadConfig(configFile);
      this.config = cfg.encrypt;
    } 
    if (!this.config) {
      this.config = Utils.loadEncryptConfig();
    }
    
    this.filesExt = this.config.fileExt || ['.js'];
    this.type = this.config.type || 'confusion';
    this.bOpt = this.config.bytecodeOptions || {};
    this.cOpt = this.config.confusionOptions || {};
    this.cleanFiles = this.config.cleanFiles || ['./public/electron'];
    this.patterns = this.config.files || null;
    this.specificFiles = [ 'electron/preload/bridge.js' ];

    // 旧属性，将废弃
    this.dirs = [];
    const directory = this.config.directory || ['electron'];
    for (let i = 0; i < directory.length; i++) {
      let codeDirPath = path.join(this.basePath, directory[i]);
      if (fs.existsSync(codeDirPath)) {
        this.dirs.push(directory[i]);
      }
    }

    this.codefiles = this._initCodeFiles();
    console.log(chalk.blue('[ee-bin] [encrypt] ') + 'cleanFiles:' + this.cleanFiles);
  }

  /**
   * 初始化需要加密的文件列表
   */
  _initCodeFiles() {
    if (!this.patterns) return;

    const files = globby.sync(this.patterns, { cwd: this.basePath });
    return files;
  }

  /**
   * 备份代码
   */
  backup() {
    // clean
    this.cleanCode();

    console.log(chalk.blue('[ee-bin] [encrypt] ') + 'backup start');
    if (this.patterns) {
      this.codefiles.forEach((filepath) => {
        let source = path.join(this.basePath, filepath);
        if (fs.existsSync(source)) {
          let target = path.join(this.encryptCodeDir, filepath);
          fsPro.copySync(source, target);
        }
      })
    } else {
      // 旧的逻辑，将废弃
      for (let i = 0; i < this.dirs.length; i++) {
        // check code dir
        let codeDirPath = path.join(this.basePath, this.dirs[i]);
        if (!fs.existsSync(codeDirPath)) {
          console.log('[ee-bin] [encrypt] ERROR: backup %s is not exist', codeDirPath);
          return
        }
  
        // copy
        let targetDir = path.join(this.encryptCodeDir, this.dirs[i]);
        console.log('[ee-bin] [encrypt] backup target Dir:', targetDir);
        if (!fs.existsSync(targetDir)) {
          this.mkdir(targetDir);
          this.chmodPath(targetDir, '777');
        }
  
        fsPro.copySync(codeDirPath, targetDir);
      }
    }

    console.log(chalk.blue('[ee-bin] [encrypt] ') + 'backup end');
    return true;
  }
  
  /**
   * 清除加密代码
   */
  cleanCode() {
    this.cleanFiles.forEach((file) => {
      let tmpFile = path.join(this.basePath, file);
      this.rmBackup(tmpFile);
      console.log(chalk.blue('[ee-bin] [encrypt] ') + 'clean up tmp files:' + chalk.magenta(`${tmpFile}`));
    })
  }

  /**
   * 加密代码
   */
  encrypt() {
    console.log(chalk.blue('[ee-bin] [encrypt] ') + 'start ciphering');
    if (this.patterns) {
      for (const file of this.codefiles) {
        const fullpath = path.join(this.encryptCodeDir, file);
        if (!fs.statSync(fullpath).isFile()) continue;

        // 特殊文件处理
        if (this.specificFiles.includes(file)) {
          this.generate(fullpath, 'confusion');
          continue;
        }

        this.generate(fullpath);
      }  
    } else {
      // 旧逻辑，将废弃
      console.log('[ee-bin] [encrypt] !!!!!! please use the new encryption method !!!!!!');
      for (let i = 0; i < this.dirs.length; i++) {
        let codeDirPath = path.join(this.encryptCodeDir, this.dirs[i]);
        this.loop(codeDirPath);
      }
      console.log('[ee-bin] [encrypt] !!!!!! please use the new encryption method !!!!!!');
    }

    console.log(chalk.blue('[ee-bin] [encrypt] ') + 'end ciphering');
  };

  /**
   * 递归
   */
  loop(dirPath) {
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
  generate(curPath, type) {
    let encryptType = type ? type : this.type;

    let tips = chalk.blue('[ee-bin] [encrypt] ') + 'file: ' + chalk.green(`${curPath}`) + ' ' + chalk.cyan(`(${encryptType})`);
    console.log(tips);

    if (encryptType == 'bytecode') {
      this.generateBytecodeFile(curPath);
    } else if (encryptType == 'confusion') {
      this.generateJSConfuseFile(curPath);
    } else {
      this.generateJSConfuseFile(curPath);
      this.generateBytecodeFile(curPath);
    }
  }

  /**
   * 使用 javascript-obfuscator 生成压缩/混淆文件
   */  
  generateJSConfuseFile(file) {
    let opt = Object.assign({
      compact: true,
      stringArray: true,
      stringArrayThreshold: 1,
    }, this.cOpt);
    
    let code = fs.readFileSync(file, "utf8");
    let result = JavaScriptObfuscator.obfuscate(code, opt);
    fs.writeFileSync(file, result.getObfuscatedCode(), "utf8"); 
  }

  /**
   * 生成字节码文件
   */
  generateBytecodeFile(curPath) {
    if (path.extname(curPath) !== '.js') {
      return
    }
    //let jscFile = curPath.replace(/.js/g, '.jsc');
    let jscFile = curPath + 'c';
    let opt = Object.assign({
      filename: curPath,
      output: jscFile,
      electron: true
    }, this.bOpt);

    bytenode.compileFile(opt);

    //fs.writeFileSync(curPath, 'require("bytenode");module.exports = require("./'+path.basename(jscFile)+'");', 'utf8');

	  fsPro.removeSync(curPath);
  }

  /**
   * 移除备份
   */
  rmBackup(file) {
    if (fs.existsSync(file)) {
      fsPro.removeSync(file);
    }
    return;
  }

  /**
   * 检查文件是否存在
   */
  fileExist(filePath) {
    try {
      return fs.statSync(filePath).isFile();
    } catch (err) {
      return false;
    }
  };

  mkdir(dirpath, dirname) {
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

  chmodPath(path, mode) {
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

  md5(file) {
    const buffer = fs.readFileSync(file);
    const hash = crypto.createHash('md5');
    hash.update(buffer, 'utf8');
    const str = hash.digest('hex');
    return str;
  }
}

const run = (options = {}) => {
  const e = new Encrypt(options);
  if (!e.backup()) return;
  e.encrypt();
}

const clean = (options = {}) => {
  let files = options.dir !== undefined ? options.dir : ['./public/electron'];
  files = is.string(files) ? [files] : files;

  files.forEach((file) => {
    const tmpFile = path.join(process.cwd(), file);
    if (fs.existsSync(tmpFile)) {
      fsPro.removeSync(tmpFile);
      console.log(chalk.blue('[ee-bin] [encrypt] ') + 'clean up tmp files: ' + chalk.magenta(`${tmpFile}`));
    }
  })
}

module.exports = {
  run,
  clean,
};