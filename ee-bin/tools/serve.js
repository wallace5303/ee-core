'use strict';

const path = require('path');
const Utils = require('../lib/utils');
const is = require('is-type-of');
const chalk = require('chalk');
const crossSpawn = require('cross-spawn');

module.exports = {

  devProcess: {},

  execProcess: {},

  /**
   * 启动前端、主进程服务
   */  
  dev(options = {}) {
    // const { config, serve } = options;
    // const binCfg = Utils.loadConfig(config);

    // let cmd = serve;
    // if (!cmd) {
    //   cmd = Object.keys(binCfg.dev).join();
    // }


    // todo 后续要不要统一用exec
    // if (cmd == 'frontend') {
    //   this.frontendServe(binCfg.dev[cmd]);
    //   return;
    // }
    // if (cmd == 'electron') {
    //   this.electronServe(binCfg.dev[cmd]);
    //   return;
    // }

    // this.frontendServe(frontend);
    // this.electronServe(electron);

    const { config, serve } = options;
    const binCmd = 'dev';
    const binCfg = Utils.loadConfig(config);
    const binCmdConfig = binCfg[binCmd];

    let command = serve;
    if (!command) {
      command = Object.keys(binCmdConfig).join();
    }

    const opt = {
      binCmd,
      binCmdConfig,
      command,
    }
    this.multiExec(opt);
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
  frontendServe(cfg) {
    // 如果是 file:// 协议，则不启动
    if (cfg.protocol == 'file://') {
      return
    }
    // 模拟前端启动慢
    // await this.sleep(5 * 1000);
    console.log(chalk.blue('[ee-bin] [dev] ') + chalk.green('Start the frontend serve...'));
    console.log(chalk.blue('[ee-bin] [dev] ') + chalk.green('config:'), JSON.stringify(cfg));

    const frontendDir = path.join(process.cwd(), cfg.directory);
    const frontendArgs = is.string(cfg.args) ? [cfg.args] : cfg.args;
    const frontendProcess = crossSpawn(
      cfg.cmd, 
      frontendArgs,
      { stdio: 'inherit', cwd: frontendDir, maxBuffer: 1024 * 1024 * 1024 },
    );
    frontendProcess.on('exit', () => {
      console.log(chalk.blue('[ee-bin] [dev] ') + chalk.green('frontend serve exit'));
    });

    this.devProcess['frontend'] = frontendProcess;
  },

  /**
   * start electron serve
   */  
  electronServe(cfg) {
    console.log(chalk.blue('[ee-bin] [dev] ') + chalk.green('Start the electron serve...'));
    console.log(chalk.blue('[ee-bin] [dev] ') + chalk.green('config:'), JSON.stringify(cfg));

    const electronDir = path.join(process.cwd(), cfg.directory);
    const electronArgs = is.string(cfg.args) ? [cfg.args] : cfg.args;
    
    const electronProcess = crossSpawn(
      cfg.cmd, 
      electronArgs, 
      {stdio: 'inherit', cwd: electronDir, maxBuffer: 1024 * 1024 * 1024 }
    );

    electronProcess.on('exit', () => {
      console.log(chalk.blue('[ee-bin] [dev] ') + chalk.green('Press "CTRL+C" to exit'));
    });

    this.devProcess['electron'] = electronProcess;
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

  /**
   * 执行自定义命令
   * 支持多个命令
   */  
  exec(options = {}) {
    const { config, command } = options;
    const binCmd = 'exec';
    const binCfg = Utils.loadConfig(config);
    const binCmdConfig = binCfg[binCmd];

    const opt = {
      binCmd,
      binCmdConfig,
      command,
    }
    this.multiExec(opt);
  },

  /**
   * 执行自定义命令
   * 支持多个命令
   */  
  multiExec(opt = {}) {
    console.log('multiExec opt:', opt)
    const { binCmd, binCmdConfig, command } = opt;
    
    let cmds;
    const cmdString = command.trim();
    if (cmdString.indexOf(',') !== -1) {
      cmds = cmdString.split(',');
    } else {
      cmds = [cmdString];
    }

    for (let i = 0; i < cmds.length; i++) {
      let cmd = cmds[i];
      let cfg = binCmdConfig[cmd];

      if (!cfg) {
        console.log(chalk.blue(`[ee-bin] [${binCmd}] `) + chalk.red(`Error: ${cmd} config does not exist` ));
        continue;
      }

      // frontend 如果是 file:// 协议，则不启动
      if (cmd == 'frontend' && cfg.protocol == 'file://') {
        continue;
      }
  
      console.log(chalk.blue(`[ee-bin] [${binCmd}] `) + chalk.green(`Run [${cmd}] command`));
      console.log(chalk.blue(`[ee-bin] [${binCmd}] `) + chalk.green('config:'), JSON.stringify(cfg));
      
      let execDir = path.join(process.cwd(), cfg.directory);
      let execArgs = is.string(cfg.args) ? [cfg.args] : cfg.args;
  
      this.execProcess[cmd] = crossSpawn(
        cfg.cmd, 
        execArgs,
        { stdio: 'inherit', cwd: execDir, maxBuffer: 1024 * 1024 * 1024 },
      );
      console.log(chalk.blue(`[ee-bin] [${binCmd}] `) + 'The ' + chalk.green(`${cmd}`) + ' command is running');

      this.execProcess[cmd].on('exit', () => {
        if (cmd == 'electron') {
          console.log(chalk.blue(`[ee-bin] [${binCmd}] `) + chalk.green('Press "CTRL+C" to exit'));
          return
        }
        console.log(chalk.blue(`[ee-bin] [${binCmd}] `) + 'The ' + chalk.green(`${cmd}`) + ' command is executed and exits');
      });
    }
  },  

}