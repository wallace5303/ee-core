'use strict';

const path = require('path');
const fs = require('fs');
const { spawn, exec } = require('child_process');
const Utils = require('../lib/utils');
const is = require('is-type-of');

module.exports = {

  /**
   * 启动前端、主进程服务
   */  
  serve(options = {}) {
    const { config } = options;
    const cfg = Utils.loadConfig(config);

    const { frontend, main } = cfg;
    console.log('frontend:', frontend);
    console.log('main:', main);

    // start frontend serve
    const frontendDir = path.join(process.cwd(), frontend.directory);
    exec(frontend.devCommond, { stdio: 'inherit', cwd: frontendDir});

    // start electron serve
    const mainDir = path.join(process.cwd(), main.directory);
    const mainArgs = is.string(main.args) ? [main.args] : main.args;
    const electronPath = this._getElectronPath();
    spawn(electronPath, mainArgs, {
      stdio: 'inherit', 
      cwd: mainDir,
    });
  },

  _getElectronPath() {
    let electronExecPath = ''
    const electronModulePath = path.dirname(require.resolve('electron'))
    const pathFile = path.join(electronModulePath, 'path.txt')
    const executablePath = fs.readFileSync(pathFile, 'utf-8')
    if (executablePath) {
      electronExecPath = path.join(electronModulePath, 'dist', executablePath)
    } else {
      throw new Error('Electron uninstall')
    }
    return electronExecPath
  },
  
}