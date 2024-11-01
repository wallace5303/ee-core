import path from 'path';
import * as Utils from '../lib/utils';
import is from 'is-type-of';
import chalk from 'chalk';
import crossSpawn from 'cross-spawn';

interface CommandConfig {
  cmd: string;
  args?: string | string[];
  directory: string;
  stdio?: string | string[];
  sync?: boolean;
}

interface BinCmdConfig {
  [key: string]: CommandConfig;
}

interface Options {
  config?: string;
  serve?: string;
  cmds?: string;
  command?: string;
}

const execProcess: Record<string, any> = {}; // 使用索引签名作为示例，根据实际结构定义类型

const moduleExports = {
  /**
   * 启动前端、主进程服务
   */
  dev(options: Options = {}) {
    const { config, serve } = options;
    const binCmd = 'dev';
    const binCfg = Utils.loadConfig(config);
    const binCmdConfig: BinCmdConfig = binCfg[binCmd];

    let command = serve;
    if (!command) {
      command = Object.keys(binCmdConfig).join();
    }

    const opt = {
      binCmd,
      binCmdConfig,
      command,
    };
    moduleExports.multiExec(opt);
  },

  /**
   * 启动主进程服务
   */
  start(options: Options = {}) {
    const { config } = options;
    const binCmd = 'start';
    const binCfg = Utils.loadConfig(config);
    const binCmdConfig: BinCmdConfig = {
      start: binCfg[binCmd],
    };

    const opt = {
      binCmd,
      binCmdConfig,
      command: binCmd,
    };
    moduleExports.multiExec(opt);
  },

  sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  },

  /**
   * 构建
   */
  build(options: Options = {}) {
    const { config, cmds } = options;
    const binCmd = 'build';
    const binCfg = Utils.loadConfig(config);
    const binCmdConfig: BinCmdConfig = binCfg[binCmd];

    if (!cmds || cmds === "") {
      let tip = chalk.bgYellow('Warning') + ' Please modify the ' + chalk.blue('build') + ' config, See: ';
      tip += chalk.underline('https://www.kaka996.com/pages/c492f8/'); 
      console.log(tip);
      return;
    }

    const opt = {
      binCmd,
      binCmdConfig,
      command: cmds,
    };
    moduleExports.multiExec(opt);
  },

  /**
   * 执行自定义命令
   */
  exec(options: Options = {}) {
    let { config, command, cmds } = options;
    const binCmd = 'exec';
    const binCfg = Utils.loadConfig(config);
    const binCmdConfig: BinCmdConfig = binCfg[binCmd];

    if (typeof command === "string") {
      cmds = command;
    }

    const opt = {
      binCmd,
      binCmdConfig,
      command: cmds,
    };
    moduleExports.multiExec(opt);
  },

  /**
   * 支持多个命令
   */
  multiExec(opt: { binCmd: string; binCmdConfig: BinCmdConfig; command: string }) {
    const { binCmd, binCmdConfig, command } = opt;

    let cmds: string[];
    const cmdString = command.trim();
    if (cmdString.indexOf(',') !== -1) {
      cmds = cmdString.split(',');
    } else {
      cmds = [cmdString];
    }

    for (let i = 0; i < cmds.length; i++) {
      let cmd = cmds[i];
      let cfg: CommandConfig | undefined = binCmdConfig[cmd];

      if (!cfg) {
        console.log(chalk.blue(`[ee-bin] [${binCmd}] `) + chalk.red(`Error: [${binCmd} ${cmd}] config does not exist`));
        continue;
      }

      if (cmd === 'frontend' && cfg.protocol === 'file://') {
        continue;
      }

      console.log(chalk.blue(`[ee-bin] [${binCmd}] `) + "Run " + chalk.green(`[${binCmd} ${cmd}]`) + " command");
      console.log(chalk.blue(`[ee-bin] [${binCmd}] `) + chalk.green('config:'), JSON.stringify(cfg));

      let execDir = path.join(process.cwd(), cfg.directory);
      let execArgs = is.string(cfg.args) ? [cfg.args] : cfg.args;
      let stdio = cfg.stdio ? cfg.stdio : 'inherit';

      const handler = cfg.sync ? crossSpawn.sync : crossSpawn;

      execProcess[cmd] = handler(
        cfg.cmd,
        execArgs,
        { stdio: stdio, cwd: execDir, maxBuffer: 1024 * 1024 * 1024 },
      );
      console.log(chalk.blue(`[ee-bin] [${binCmd}] `) + 'The ' + chalk.green(`[${binCmd} ${cmd}]`) + ` command is ${cfg.sync ? 'run completed' : 'running'}`);

      if (!cfg.sync) {
        execProcess[cmd].on('exit', () => {
          if (cmd === 'electron') {
            console.log(chalk.blue(`[ee-bin] [${binCmd}] `) + chalk.green('Press "CTRL+C" to exit'));
            return;
          }
          console.log(chalk.blue(`[ee-bin] [${binCmd}] `) + 'The ' + chalk.green(`[${binCmd} ${cmd}]`) + ' command is executed and exits');
        });
      }
    }
  },
};

export = moduleExports;