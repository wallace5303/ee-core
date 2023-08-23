'use strict';

const path = require('path');
const { spawn, exec } = require('child_process');
const Utils = require('../lib/utils');
const is = require('is-type-of');
const chalk = require('chalk');
const iconv = require('iconv-lite');
const { Buffer } = require('buffer');

module.exports = {

  frontendProcess: undefined,

  electronProcess: undefined,

  /**
   * 启动前端、主进程服务
   */  
  dev(options = {}) {
    const { config } = options;
    const cfg = Utils.loadConfig(config);
    const { frontend, electron } = cfg.dev;
    this.frontendServe(frontend);
    this.electronServe(electron);
  },

  /**
   * 启动主进程服务
   */  
  start(options = {}) {
    const { config } = options;
    const cfg = Utils.loadConfig(config);

    this.electronServe(cfg.start);
  },

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  /**
   * 前端服务
   */  
  async frontendServe(cfg) {
    // 如果是 file:// 协议，则不启动
    if (cfg.protocol == 'file://') {
      return
    }

    // start frontend serve
    console.log(chalk.blue('[ee-bin] [dev] ') + chalk.green('Start the frontend serve...'));
    console.log(chalk.blue('[ee-bin] [dev] ') + chalk.green('config:'), JSON.stringify(cfg));

    const frontendDir = path.join(process.cwd(), cfg.directory);
    const isWindows = Utils.isWindows();
    const cmdEncoding = isWindows ? 'binary' : 'utf8';
    const msgEncoding = isWindows ? 'cp936' : 'utf8';
    this.frontendProcess = exec(
      cfg.cmd, 
      { stdio: 'inherit', cwd: frontendDir, encoding: cmdEncoding},
      (err) => {
        if (err) {
          const errMsg = iconv.decode(new Buffer.from(err.message, cmdEncoding), msgEncoding);
          console.log(chalk.blue('[ee-bin] [dev] ') + chalk.red(`Error: ${errMsg}`))
          process.exit();
        }
      }
    );
    
    this.frontendProcess.stdout.on('data', (data) => {
      let out = data;
      if (isWindows) {
        out = iconv.decode(new Buffer.from(data, cmdEncoding), 'utf8');
      }
      console.log(chalk.blue('[ee-bin] [dev] ') + `frontend ${out}`);
    });
    this.frontendProcess.stderr.on('data', (data) => {
      let out = data;
      if (isWindows) {
        out = iconv.decode(new Buffer.from(data, cmdEncoding), 'utf8');
      }
      console.error(chalk.blue('[ee-bin] [dev] ') + `frontend ${out}`);
    });
  },

  /**
   * 主进程服务
   */  
  electronServe(cfg) {
    // start electron serve
    console.log(chalk.blue('[ee-bin] [dev] ') + chalk.green('Start the electron serve...'));
    console.log(chalk.blue('[ee-bin] [dev] ') + chalk.green('config:'), JSON.stringify(cfg));

    const electronDir = path.join(process.cwd(), cfg.directory);
    const electronArgs = is.string(cfg.args) ? [cfg.args] : cfg.args;
    
    // 疑问，为什么直接使用 electron，spawn会报错(或许是衍生shell问题，衍生的shell有系统环境变量)
    let electronProgram 
    if (cfg.cmd == 'electron') {
      electronProgram = Utils.getElectronProgram();
    }

    this.electronProcess = spawn(
      electronProgram, 
      electronArgs, 
      {stdio: 'inherit', cwd: electronDir,}
    );

    this.electronProcess.on('exit', () => {
      setTimeout(() => {
        process.exit();
      }, 500)
    });
  },  

  /**
   * 构建前端 dist 
   */  
  build(options = {}) {
    const { config } = options;
    const cfg = Utils.loadConfig(config);
    const buildCfg = cfg.build;

    // start build frontend dist
    console.log(chalk.blue('[ee-bin] [build] ') + chalk.green('Build frontend dist'));
    console.log(chalk.blue('[ee-bin] [build] ') + chalk.green('config:'), buildCfg);
    
    let i = 1;
    let buildProgress = setInterval(() => {
      console.log(chalk.blue('[ee-bin] [build] ') + `${i}s`);
      i++;
    }, 1000)

    const frontendDir = path.join(process.cwd(), buildCfg.directory);
    const buildProcess = exec(
      buildCfg.cmd, 
      { stdio: 'inherit', cwd: frontendDir, },  // maxBuffer: 1024 * 1024 * 1024
      (err) => {
        if (err) {
          console.log(chalk.blue('[ee-bin] [build] ') + chalk.red(`Error: ${err.message}`))
          process.exit();
        }
        clearInterval(buildProgress);
        console.log(chalk.blue('[ee-bin] [build] ') + chalk.green('End'));
      }
    );
    
    buildProcess.stdout.on('data', (data) => {
      console.log(chalk.blue('[ee-bin] [build] ') + `frontend ${data}`);
    });
    buildProcess.stderr.on('data', (data) => {
      console.error(chalk.blue('[ee-bin] [build] ') + chalk.yellow(`Warning: ${data}`));
    });    
  },
}