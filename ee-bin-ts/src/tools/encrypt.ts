import path from 'path';
import fs from 'fs';
import fsPro from 'fs-extra';
import bytenode from 'bytenode';
import crypto from 'crypto';
import JavaScriptObfuscator from 'javascript-obfuscator';
import globby from 'globby';
import chalk from 'chalk';
import Utils from '../lib/utils';

type Config = {
  fileExt?: string[];
  type?: string;
  bytecodeOptions?: Record<string, any>;
  confusionOptions?: Record<string, any>;
  cleanFiles?: string[];
  files?: string[];
  directory?: string[];
};

class Encrypt {
  basePath: string;
  encryptCodeDir: string;
  config: Config;
  filesExt: string[];
  type: string;
  bOpt: Record<string, any>;
  cOpt: Record<string, any>;
  cleanFiles: string[];
  patterns: string[] | null;
  specificFiles: string[];
  dirs: string[];
  codefiles: string[];

  constructor(options: { out?: string; config?: string } = {}) {
    const outputFolder = options.out || './public';
    const configFile = options.config || './electron/config/bin.js';

    this.basePath = process.cwd();
    this.encryptCodeDir = path.join(this.basePath, outputFolder);

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
    this.specificFiles = ['electron/preload/bridge.js'];

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

  _initCodeFiles(): string[] {
    if (!this.patterns) return [];

    const files = globby.sync(this.patterns, { cwd: this.basePath });
    return files;
  }

  backup(): boolean {
    this.cleanCode();

    console.log(chalk.blue('[ee-bin] [encrypt] ') + 'backup start');
    if (this.patterns) {
      this.codefiles.forEach((filepath) => {
        let source = path.join(this.basePath, filepath);
        if (fs.existsSync(source)) {
          let target = path.join(this.encryptCodeDir, filepath);
          fsPro.copySync(source, target);
        }
      });
    } else {
      for (let i = 0; i < this.dirs.length; i++) {
        let codeDirPath = path.join(this.basePath, this.dirs[i]);
        if (!fs.existsSync(codeDirPath)) {
          console.log('[ee-bin] [encrypt] ERROR: backup %s is not exist', codeDirPath);
          return false;
        }

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

  cleanCode(): void {
    this.cleanFiles.forEach((file) => {
      let tmpFile = path.join(this.basePath, file);
      this.rmBackup(tmpFile);
      console.log(chalk.blue('[ee-bin] [encrypt] ') + 'clean up tmp files:' + chalk.magenta(`${tmpFile}`));
    });
  }

  encrypt(): void {
    console.log(chalk.blue('[ee-bin] [encrypt] ') + 'start ciphering');
    if (this.patterns) {
      for (const file of this.codefiles) {
        const fullpath = path.join(this.encryptCodeDir, file);
        if (!fs.statSync(fullpath).isFile()) continue;

        if (this.specificFiles.includes(file)) {
          this.generate(fullpath, 'confusion');
          continue;
        }

        this.generate(fullpath);
      }
    } else {
      console.log('[ee-bin] [encrypt] !!!!!! please use the new encryption method !!!!!!');
      for (let i = 0; i < this.dirs.length; i++) {
        let codeDirPath = path.join(this.encryptCodeDir, this.dirs[i]);
        this.loop(codeDirPath);
      }
      console.log('[ee-bin] [encrypt] !!!!!! please use the new encryption method !!!!!!');
    }

    console.log(chalk.blue('[ee-bin] [encrypt] ') + 'end ciphering');
  }

  loop(dirPath: string): void {
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

  generate(curPath: string, type?: string): void {
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

  generateJSConfuseFile(file: string): void {
    let opt = Object.assign({
      compact: true,
      stringArray: true,
      stringArrayThreshold: 1,
    }, this.cOpt);
    
    let code = fs.readFileSync(file, "utf8");
    let result = JavaScriptObfuscator.obfuscate(code, opt);
    fs.writeFileSync(file, result.getObfuscatedCode(), "utf8"); 
  }

  generateBytecodeFile(curPath: string): void {
    if (path.extname(curPath) !== '.js') {
      return
    }
    let jscFile = curPath + 'c';
    let opt = Object.assign({
      filename: curPath,
      output: jscFile,
      electron: true
    }, this.bOpt);

    bytenode.compileFile(opt);

    fsPro.removeSync(curPath);
  }

  rmBackup(file: string): void {
    if (fs.existsSync(file)) {
      fsPro.removeSync(file);
    }
  }

  fileExist(filePath: string): boolean {
    try {
      return fs.statSync(filePath).isFile();
    } catch (err) {
      return false;
    }
  };

  mkdir(dirpath: string, dirname?: string): void {
    if (typeof dirname === 'undefined') {
      if (fs.existsSync(dirpath)) {
        return;
      }
      this.mkdir(dirpath, path.dirname(dirpath));
    } else {
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

  chmodPath(path: string, mode: string): void {
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

  md5(file: string): string {
    const buffer = fs.readFileSync(file);
    const hash = crypto.createHash('md5');
    hash.update(buffer, 'utf8');
    const str = hash.digest('hex');
    return str;
  }
}

const run = (options: { out?: string; config?: