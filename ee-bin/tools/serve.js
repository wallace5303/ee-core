'use strict';

const path = require('path');
const Utils = require('../lib/utils');
const is = require('is-type-of');
const chalk = require('chalk');
const crossSpawn = require('cross-spawn');

module.exports = {

  frontendProcess: undefined,

  electronProcess: undefined,

  /**
   * 启动前端、主进程服务
   */  
  dev(options = {}) {
    const { config, serve } = options;
    const binCfg = Utils.loadConfig(config);
    const { frontend, electron } = binCfg.dev;

    if (serve == 'frontend') {
      this.frontendServe(frontend);
      return;
    }

    if (serve == 'electron') {
      this.electronServe(electron);
      return;
    }

    this.frontendServe(frontend);
    this.electronServe(electron);
  },

  /**
   * 启动主进程服务
   */  
  start(options = {}) {
    const { config } = options;
    const binCfg = Utils.loadConfig(config);

    this.electronServe(binCfg.start);
  },

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  /**
   * start frontend serve
   */  
  async frontendServe(cfg) {
    // 如果是 file:// 协议，则不启动
    if (cfg.protocol == 'file://') {
      return
    }
    await this.sleep(5 * 1000);
    console.log(chalk.blue('[ee-bin] [dev] ') + chalk.green('Start the frontend serve...'));
    console.log(chalk.blue('[ee-bin] [dev] ') + chalk.green('config:'), JSON.stringify(cfg));

    const frontendDir = path.join(process.cwd(), cfg.directory);
    const frontendArgs = is.string(cfg.args) ? [cfg.args] : cfg.args;
    this.frontendProcess = crossSpawn(
      cfg.cmd, 
      frontendArgs,
      { stdio: 'inherit', cwd: frontendDir, maxBuffer: 1024 * 1024 * 1024 },
    );
    this.frontendProcess.on('exit', () => {
      console.log(chalk.blue('[ee-bin] [dev] ') + chalk.green('frontend serve exit'));
    });
  },

  /**
   * start electron serve
   */  
  electronServe(cfg) {
    console.log(chalk.blue('[ee-bin] [dev] ') + chalk.green('Start the electron serve...'));
    console.log(chalk.blue('[ee-bin] [dev] ') + chalk.green('config:'), JSON.stringify(cfg));

    const electronDir = path.join(process.cwd(), cfg.directory);
    const electronArgs = is.string(cfg.args) ? [cfg.args] : cfg.args;
    
    this.electronProcess = crossSpawn(
      cfg.cmd, 
      electronArgs, 
      {stdio: 'inherit', cwd: electronDir, maxBuffer: 1024 * 1024 * 1024 }
    );

    this.electronProcess.on('exit', () => {
      console.log(chalk.blue('[ee-bin] [dev] ') + chalk.green('Press "CTRL+C" to exit'));
    });
  },  

  /**
   * 构建前端 dist 
   */  
  build(options = {}) {
    const { config } = options;
    const binCfg = Utils.loadConfig(config);
    const cfg = binCfg.build;

    // start build frontend dist
    console.log(chalk.blue('[ee-bin] [build] ') + chalk.green('Build frontend dist'));
    console.log(chalk.blue('[ee-bin] [build] ') + chalk.green('config:'), cfg);
    
    const frontendDir = path.join(process.cwd(), cfg.directory);
    const buildArgs = is.string(cfg.args) ? [cfg.args] : cfg.args;

    const buildProcess = crossSpawn(
      cfg.cmd, 
      buildArgs,
      { stdio: 'inherit', cwd: frontendDir, maxBuffer: 1024 * 1024 * 1024 },
    );
    buildProcess.on('exit', () => {
      console.log(chalk.blue('[ee-bin] [build] ') + chalk.green('End'));
    }); 
  },
}