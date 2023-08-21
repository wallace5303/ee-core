'use strict';

const path = require('path');
const fs = require('fs');
const { spawn, exec } = require('child_process');
const Utils = require('../lib/utils');
const is = require('is-type-of');
const chalk = require('chalk');

module.exports = {

  /**
   * 启动前端、主进程服务
   */  
  run(options = {}) {
    const { config } = options;
    const cfg = Utils.loadConfig(config);
    const { frontend, electron } = cfg.dev;
    console.log("cfg.dev:", cfg.dev);

    // start frontend serve
    console.log(chalk.blue('[ee-bin] [serve] ') + chalk.green('Start the frontend serve...'));
    const frontendDir = path.join(process.cwd(), frontend.directory);
    exec(frontend.cmd, { stdio: 'inherit', cwd: frontendDir});

    // start electron serve
    console.log(chalk.blue('[ee-bin] [serve] ') + chalk.green('Start the electron serve...'));
    const electronDir = path.join(process.cwd(), electron.directory);
    const electronArgs = is.string(electron.args) ? [electron.args] : electron.args;
    spawn(electron.cmd, electronArgs, {
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
    console.log(chalk.blue('[ee-bin] [build] ') + chalk.green(`directory: `) + buildCfg.directory);
    console.log(chalk.blue('[ee-bin] [build] ') + chalk.green(`cmd: `) + buildCfg.cmd);
    
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

  /**
   * no used
   */   
  _getElectronPath() {
    let electronExecPath = ''
    const electronModulePath = path.dirname(require.resolve('electron'))
    const pathFile = path.join(electronModulePath, 'path.txt')
    const executablePath = fs.readFileSync(pathFile, 'utf-8')
    if (executablePath) {
      electronExecPath = path.join(electronModulePath, 'dist', executablePath)
    } else {
      throw new Error('Check that electron is installed!')
    }
    return electronExecPath
  },
  
}