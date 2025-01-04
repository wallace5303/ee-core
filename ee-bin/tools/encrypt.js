'use strict';

const path = require('path');
const fs = require('fs');
const fsPro = require('fs-extra');
const is = require('is-type-of');
const bytenode = require('bytenode');
const JavaScriptObfuscator = require('javascript-obfuscator');
const globby = require('globby');
const chalk = require('chalk');
const { loadConfig } = require('../lib/utils');

const EncryptTypes = ['bytecode', 'confusion', 'strict'];

class Encrypt {
  constructor(options = {}) {
    // cli args
    const { config, out } = options;
    const outputFolder = out || './public';

    this.basePath = process.cwd();
    this.encryptCodeDir = path.join(this.basePath, outputFolder);
    const cfg = loadConfig(config);
    this.config = cfg.encrypt;
    
    this.filesExt = this.config.fileExt;
    this.type = this.config.type;
    this.bOpt = this.config.bytecodeOptions;
    this.cOpt = this.config.confusionOptions;
    this.cleanFiles = this.config.cleanFiles;
    this.patterns = this.config.files || null;
    this.specFiles = this.config.specificFiles;

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
    this.codefiles.forEach((filepath) => {
      let source = path.join(this.basePath, filepath);
      if (fs.existsSync(source)) {
        let target = path.join(this.encryptCodeDir, filepath);
        fsPro.copySync(source, target);
      }
    })

    console.log(chalk.blue('[ee-bin] [encrypt] ') + 'backup end');
    return true;
  }
  
  /**
   * 清除加密代码
   */
  cleanCode() {
    this.cleanFiles.forEach((file) => {
      let tmpFile = path.join(this.basePath, file);
      fsPro.removeSync(tmpFile);
      console.log(chalk.blue('[ee-bin] [encrypt] ') + 'clean up tmp files:' + chalk.magenta(`${tmpFile}`));
    })
  }

  /**
   * 加密代码
   */
  encrypt() {
    console.log(chalk.blue('[ee-bin] [encrypt] ') + 'start ciphering');
    for (const file of this.codefiles) {
      const fullpath = path.join(this.encryptCodeDir, file);
      if (!fs.statSync(fullpath).isFile()) continue;

      // 特殊文件处理
      if (this.specFiles.includes(file)) {
        this.generate(fullpath, 'confusion');
        continue;
      }

      this.generate(fullpath);
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
    if (encryptType == 'strict') {
      this.generateJSConfuseFile(curPath);
      this.generateBytecodeFile(curPath);
    } else if (encryptType == 'bytecode') {
      this.generateBytecodeFile(curPath);
    } else if (encryptType == 'confusion') {
      this.generateJSConfuseFile(curPath);
    } else {
      // none
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
	  fsPro.removeSync(curPath);
  }
}

function encrypt(options = {}) {
  const enc = new Encrypt(options);
  if (EncryptTypes.indexOf(enc.type) == -1) return;
  //if (!enc.backup()) return;
  enc.encrypt();
}

function cleanEncrypt(options = {}) {
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
  encrypt,
  cleanEncrypt,
};