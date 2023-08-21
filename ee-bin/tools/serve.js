'use strict';

const path = require('path');
const { spawn, exec } = require('child_process');
const Utils = require('../lib/utils');
const is = require('is-type-of');
const chalk = require('chalk');

module.exports = {

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
    // start frontend serve
    console.log(chalk.blue('[ee-bin] [frontendServe] ') + chalk.green('Start the frontend serve...'));
    console.log(chalk.blue('[ee-bin] [frontendServe] ') + chalk.green('config:'), cfg);

    const frontendDir = path.join(process.cwd(), cfg.directory);
    exec(cfg.cmd, { stdio: 'inherit', cwd: frontendDir});
  },

  /**
   * 主进程服务
   */  
  electronServe(cfg) {
    // start electron serve
    console.log(chalk.blue('[ee-bin] [electronServe] ') + chalk.green('Start the electron serve...'));
    console.log(chalk.blue('[ee-bin] [electronServe] ') + chalk.green('config:'), cfg);

    const electronDir = path.join(process.cwd(), cfg.directory);
    const electronArgs = is.string(cfg.args) ? [cfg.args] : cfg.args;
    
    // 疑问，为什么直接使用 electron，spawn会报错
    let electronProgram 
    if (cfg.cmd == 'electron') {
      electronProgram = Utils.getElectronProgram();
    }

    spawn(electronProgram, electronArgs, {
      stdio: 'inherit', 
      cwd: electronDir,
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
    exec(
      buildCfg.cmd, 
      { stdio: 'inherit', cwd: frontendDir, maxBuffer: 1024 * 1024 * 1024}, 
      (error, stdout, stderr) => {
        if (error) {
          console.log(chalk.red('build error:') + error);
          return;
        }
        console.log(stdout);
        console.log(stderr);
        clearInterval(buildProgress);
        console.log(chalk.blue('[ee-bin] [build] ') + chalk.green('End'));
      }
    );
  },
}