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

  /**
   * 前端服务
   */  
  frontendServe(cfg) {
    // 如果是 file:// 协议，则不启动
    if (cfg.protocol == 'file://') {
      return
    }

    // start frontend serve
    console.log(chalk.blue('[ee-bin] [frontendServe] ') + chalk.green('Start the frontend serve...'));
    console.log(chalk.blue('[ee-bin] [frontendServe] ') + chalk.green('config:'), JSON.stringify(cfg));

    const frontendDir = path.join(process.cwd(), cfg.directory);
    this.frontendProcess = exec(
      cfg.cmd, 
      { stdio: 'inherit', cwd: frontendDir, encoding: 'binary'}, // buffer utf-8 
      (error, stdout, stderr) => {
        if (error) {

          let errMsg = error.message;
          //errMsg = '你'
          var encodedBuff = iconv.encode(errMsg, 'utf-8');
          console.log(encodedBuff);
          // const buf = Buffer.from(error);
          // console.log('is str:', typeof error);
          // console.log('is str:', JSON.stringify(error));
          // console.log('is str:', error)
          //console.log('is str:', iconv.decode(Buffer.from(error), 'cp936'))
          // var chunks = [];
          // chunks = Buffer.concat(error);
          // const decodedText = iconv.decode(chunks, 'gbk')
          //const decodedText = iconv.encode(_de, 'utf-8').toString().trim() || ''
          //var decodedText = iconv.decode(error, 'gbk');
          console.log(iconv.decode(new Buffer.from(error.message, 'binary'), 'cp936'))
          //console.log(iconv.decode(Buffer.from(errMsg), 'utf-8'))
          //console.log(chalk.blue('[ee-bin] [frontendServe] ') + chalk.red(`${error}`));
          process.exit();
        }
        // console.log(stdout);
        // console.log(stderr);
      });

    // this.frontendProcess.stdout.on('data', (data) => {
    //   console.log(chalk.blue('[ee-bin] [frontendServe] ') + `${data}`);
    // });
    // this.frontendProcess.stderr.on('data', (data) => {
    //   console.error(chalk.blue('[ee-bin] [frontendServe] ') + `${data}`);
    // });
  },

  /**
   * 主进程服务
   */  
  electronServe(cfg) {
    // start electron serve
    console.log(chalk.blue('[ee-bin] [electronServe] ') + chalk.green('Start the electron serve...'));
    console.log(chalk.blue('[ee-bin] [electronServe] ') + chalk.green('config:'), JSON.stringify(cfg));

    const electronDir = path.join(process.cwd(), cfg.directory);
    const electronArgs = is.string(cfg.args) ? [cfg.args] : cfg.args;
    
    // 疑问，为什么直接使用 electron，spawn会报错(或许是衍生shell问题，衍生的shell有系统环境变量)
    let electronProgram 
    if (cfg.cmd == 'electron') {
      electronProgram = Utils.getElectronProgram();
    }

    this.electronProcess = spawn(electronProgram, electronArgs, {
      stdio: 'inherit', 
      cwd: electronDir,
    });

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
      console.log(chalk.blue('[ee-bin] [build] ') + chalk.magenta(`${i}s`));
      i++;
    }, 1000)

    const frontendDir = path.join(process.cwd(), buildCfg.directory);
    const buildProcess = exec(
      buildCfg.cmd, 
      { stdio: 'inherit', cwd: frontendDir, maxBuffer: 1024 * 1024 * 1024}, 
      (error, stdout, stderr) => {
        if (error) {
          console.log(chalk.red('build error:') + error);
          process.exit();
        }
        console.log(stdout);
        console.log(stderr);
        clearInterval(buildProgress);
        console.log(chalk.blue('[ee-bin] [build] ') + chalk.green('End'));
      }
    );
  },
}