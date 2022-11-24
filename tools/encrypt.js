'use strict';

const path = require('path');
const fs = require('fs');
const fsPro = require('fs-extra');
const is = require('is-type-of');
const bytenode = require('bytenode');
const utility = require('utility');
const crypto = require('crypto');
const JavaScriptObfuscator = require('javascript-obfuscator');

class Encrypt {
  constructor() {
    this.basePath = process.cwd();
    this.dirs = [];
    this.encryptCodeDir = path.join(this.basePath, 'public');
    this.config = this.loadConfig('encrypt.js');
    this.filesExt = this.config.fileExt || ['.js'];
    this.type = this.config.type || 'bytecode';
    const directory = this.config.directory || ['electron'];
    this.tmpFile = '';
    this.mapFile = '';

    // cli
    if (Object.keys(this.config).length == 0) {
      for (let i = 0; i < process.argv.length; i++) {
        let tmpArgv = process.argv[i];
        if (tmpArgv.indexOf('--type=') !== -1) {
          this.type = tmpArgv.substring(7);
        }
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
  
  prepare () {
    if (this.type == 'bytecode') {
      let filename = this.config.mangle || this.config.mangle.file || null;
      if (filename) {
        this.tmpFile = path.join(this.encryptCodeDir, 'electron', 'tmp.json');
        this.mapFile = path.join(this.encryptCodeDir, 'electron', filename);
        fs.writeFileSync(this.mapFile, '');
        const content = {
          nameMap: {}
        };
        utility.writeJSONSync(this.tmpFile, content);
      }
    }

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
    } else if (this.type == 'confusion') {
      this.generateJSConfuseFile(curPath);
    } else {
      this.generateJSConfuseFile(curPath);
      this.generateBytecodeFile(curPath);
    }
  }

  /**
   * 使用 javascript-obfuscator 生成压缩/混淆文件
   */  
  generateJSConfuseFile (file) {
    let defaultOpt = {
      compact: true,
      stringArray: true,
      rotateStringArray: true,
      stringArrayEncoding: ['base64'],
      stringArrayThreshold: 1,
      disableConsoleOutput: true,
    }
    let code = fs.readFileSync(file, "utf8");
    let result = JavaScriptObfuscator.obfuscate(code, defaultOpt);
    fs.writeFileSync(file, result.getObfuscatedCode(), "utf8"); 
  }

  /**
   * (废弃) 使用 uglify 生成压缩/混淆文件
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
    if (is.object(this.config.uglifyOpt)) {
      options = Object.assign(defaultOpt, this.config.uglifyOpt);
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
      electron: true
    });

    //fs.writeFileSync(curPath, 'require("bytenode");module.exports = require("./'+path.basename(jscFile)+'");', 'utf8');

	  fsPro.removeSync(curPath);
  }

  /**
   * 移除备份
   */
  rmBackup (dir) {
    if (fs.existsSync(dir)) {
      console.log('[ee-core] [encrypt] clean old directory:', dir);
      fsPro.removeSync(dir);
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

  loadConfig (prop) {
    const filepath = path.join(this.basePath, 'electron', 'config', prop);
    if (!fs.existsSync(filepath)) {
      return {};
    }
    const obj = require(filepath);
    if (!obj) return obj;

    let ret = obj;
    if (is.function(obj) && !is.class(obj)) {
      ret = obj();
    }

    return ret || {};
  };

  md5 (file) {
    const buffer = fs.readFileSync(file);
    const hash = crypto.createHash('md5');
    hash.update(buffer, 'utf8');
    const str = hash.digest('hex');
    return str;
  }
}

const run = () => {
  const e = new Encrypt();
  if (!e.backup()) return;
  //if (!e.prepare()) return;
  e.encrypt();
}

module.exports = {
  run
};