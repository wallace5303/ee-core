'use strict';

const debug = require('debug')('ee-bin:serve');
const path = require('path');
const { loadConfig } = require('../lib/utils');
const is = require('is-type-of');
const chalk = require('chalk');
const crossSpawn = require('cross-spawn');
const { buildSync } = require('esbuild');

class ServeProcess {

  constructor() {
    this.execProcess = {};
  }

  /**
   * 启动前端、主进程服务
   */
  dev(options = {}) {
    const { config, serve } = options;
    const binCfg = loadConfig(config);
    const binCmd = 'dev';
    const binCmdConfig = binCfg[binCmd];

    let command = serve;
    if (!command) {
      command = Object.keys(binCmdConfig).join();
    }

    // build electron code 
    const cmds = this._formatCmds(command);
    if (cmds.indexOf("electron") !== -1) {
      const electronBuildConfig = binCfg.build.electron;
      const esbuildOptions = electronBuildConfig[electronBuildConfig.language];
      debug('esbuild options:%O', esbuildOptions);
      buildSync(esbuildOptions);
    }

    const opt = {
      binCmd,
      binCmdConfig,
      command,
    }
    this.multiExec(opt);
  }

  /**
   * 启动主进程服务
   */
  start(options = {}) {
    const { config } = options;
    const binCfg = loadConfig(config);
    const binCmd = 'start';
    const binCmdConfig = {
      start: binCfg[binCmd]
    };

    const opt = {
      binCmd,
      binCmdConfig,
      command: binCmd,
    }
    this.multiExec(opt);
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 构建
   */
  build(options = {}) {
    const { config, cmds } = options;
    const binCfg = loadConfig(config);
    const binCmd = 'build';
    const binCmdConfig = binCfg[binCmd];

    if (!cmds || cmds == "") {
      const tip = chalk.bgYellow('Warning') + ' Please modify the ' + chalk.blue('build') + ' property in the bin file';
      console.log(tip);
      return
    }

    const opt = {
      binCmd,
      binCmdConfig,
      command: cmds,
    }
    this.multiExec(opt);
  }

  /**
   * 执行自定义命令
   */
  exec(options = {}) {
    const { config, cmds } = options;
    const binCfg = loadConfig(config);
    const binCmd = 'exec';
    const binCmdConfig = binCfg[binCmd];

    const opt = {
      binCmd,
      binCmdConfig,
      command: cmds,
    }
    this.multiExec(opt);
  }

  /**
   * 支持多个命令
   */
  multiExec(opt = {}) {
    //console.log('multiExec opt:', opt)
    const { binCmd, binCmdConfig, command } = opt;
    const cmds = this._formatCmds(command);

    for (let i = 0; i < cmds.length; i++) {
      let cmd = cmds[i];
      const cfg = binCmdConfig[cmd];

      if (!cfg) {
        console.log(chalk.blue(`[ee-bin] [${binCmd}] `) + chalk.red(`Error: [${binCmd} ${cmd}] config does not exist` ));
        continue;
      }

      // frontend 如果是 file:// 协议，则不启动
      if (binCmd == 'dev' && cmd == 'frontend' && cfg.protocol == 'file://') {
        continue;
      }

      console.log(chalk.blue(`[ee-bin] [${binCmd}] `) + "Run " + chalk.green(`[${binCmd} ${cmd}]` + " command"));
      console.log(chalk.blue(`[ee-bin] [${binCmd}] `) + chalk.green('config:'), JSON.stringify(cfg));

      const execDir = path.join(process.cwd(), cfg.directory);
      const execArgs = is.string(cfg.args) ? [cfg.args] : cfg.args;
      const stdio = cfg.stdio ? cfg.stdio: 'inherit';

      const handler = cfg.sync ? crossSpawn.sync : crossSpawn;

      this.execProcess[cmd] = handler(
        cfg.cmd,
        execArgs,
        { stdio: stdio, cwd: execDir, maxBuffer: 1024 * 1024 * 1024 },
      );
      console.log(chalk.blue(`[ee-bin] [${binCmd}] `) + 'The ' + chalk.green(`[${binCmd} ${cmd}]`) + ` command is ${cfg.sync ? 'run completed' : 'running'}`);

      if(!cfg.sync) {
        this.execProcess[cmd].on('exit', () => {
          if (cmd == 'electron') {
            console.log(chalk.blue(`[ee-bin] [${binCmd}] `) + chalk.green('Press "CTRL+C" to exit'));
            return
          }
          console.log(chalk.blue(`[ee-bin] [${binCmd}] `) + 'The ' + chalk.green(`[${binCmd} ${cmd}]`) + ' command has been executed and exited');
        });
      }
    }
  } 
  
  // format commands
  _formatCmds(command) {
    let cmds;
    const cmdString = command.trim();
    if (cmdString.indexOf(',') !== -1) {
      cmds = cmdString.split(',');
    } else {
      cmds = [cmdString];
    }

    return cmds;
  }  
}

module.exports = {
  ServeProcess,
  serveProcess: new ServeProcess()
}
