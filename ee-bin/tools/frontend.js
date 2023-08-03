'use strict';

const path = require('path');
const fs = require('fs');
const { spawn, spawnSync } = require('child_process');
const Util = require('../lib/util');
const is = require('is-type-of');

module.exports = {

  electronServer: undefined,

  frontendServer: undefined,

  /**
   * 启动前端、主进程服务
   */  
  serve(options = {}) {
    const { config } = options;
    const cfg = Util.loadConfig(config);

    const { frontend, main } = cfg;
    console.log('frontend:', frontend);
    console.log('main:', main);

    const frontendDir = path.join(process.cwd(), frontend.directory);
    const frontendArgs = is.string(frontend.args) ? [frontend.args] : frontend.args;
    console.log('frontendDir:', frontendDir);
    console.log('frontendArgs:', frontendArgs);
    this.frontendServer = spawn(
      frontend.cmd, 
      frontendArgs,
      {
        stdio: 'inherit', 
        cwd: frontendDir
      }
    );
    
    const electronPath = this._getElectronPath();
    const mainArgs = is.string(main.args) ? [main.args] : main.args;
    this.electronServer = spawn(electronPath, mainArgs, { stdio: 'inherit' });
    
    this._init();
  },

  _getElectronPath() {
    let electronExecPath = ''
    const electronModulePath = path.dirname(require.resolve('electron'))
    const pathFile = path.join(electronModulePath, 'path.txt')
    let executablePath
    if (fs.existsSync(pathFile)) {
      executablePath = fs.readFileSync(pathFile, 'utf-8')
    }
    if (executablePath) {
      electronExecPath = path.join(electronModulePath, 'dist', executablePath)
    } else {
      throw new Error('Electron uninstall')
    }
    return electronExecPath
  },

  /**
   * 事件监听
   */
  _init() {
    // this.frontendServer.on('data', (data) => {
    //   console.log(`[ee-bin] [serve] frontend-server data:${data}`);
    // });
    // this.frontendServer.on('exit', (code, signal) => {
    //   console.log(`[ee-bin] [serve] frontend-server code:${code}, signal:${signal}`);
    // });

    // this.frontendServer.on('error', (err) => {
    //   console.log(`[ee-bin] [serve] frontendServer error: ${err}`);
    // });

    // this.electronServer.on('exit', (code, signal) => {
    //   console.log(`[ee-bin] [serve] electronServer code:${code}, signal:${signal}`);
    // });

    // this.electronServer.on('error', (err) => {
    //   console.log(`[ee-bin] [serve] electronServer error: ${err}`);
    // });
  }  
}