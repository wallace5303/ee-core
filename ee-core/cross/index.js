const fs = require('fs');
const crossSpawn = require('cross-spawn');
const path = require('path');
const is = require('is-type-of');
const Conf = require('../config/cache');
const UtilsHelper = require('../utils/helper');
const UtilsIs = require('../utils/is');
const UtilsPargv = require('../utils/pargv');
const Ps = require('../ps');
const Log = require('../log');
const GetPort = require('../utils/get-port');
const { app: electronApp } = require('electron');

/**
 * Cross-language service
 * 跨语言服务
 */
const CrossLanguageService = {

  children: {},

  /**
   * create
   */
  async create() {
    if (!Ps.isProd()) {
      return
    }

    // init dir
    this._initPath();

    // boot services
    const servicesCfg = Conf.getValue('cross');
    //await UtilsHelper.sleep(5 * 1000);

    for (let key of Object.keys(servicesCfg)) {
      let cfg = servicesCfg[key];
      if (cfg.enable == true) {
        this.run(cfg)
      }
    }
  },

  /**
   * run
   */
  async run(conf = {}) {
    const cmdName = conf.name;
    const cmdPath = this._getCmdPath(cmdName);
    let cmdArgs = is.string(conf.args) ? [conf.args] : conf.args;

    // 动态生成port
    // if (Ps.isProd() || this.workspaces.length > 0) {
    let confPort = this.getArgs(cmdArgs, 'port');
    if (!confPort) {
      throw new Error(`[ee-core] [cross/run]  --port parameter does not exist!`);
    }
    confPort = await GetPort({ port: confPort });
    // 替换port
    cmdArgs = this.replaceValue(cmdArgs, "--port=", confPort)

    Log.coreLogger.info(`[ee-core] [cross/run] cmd: ${cmdPath}, args: ${cmdArgs}`);

    // Launch executable program
    let standardOutput = 'ignore';
    if (!Ps.isPackaged()) {
      standardOutput = 'inherit'
    }
    const coreProcess = crossSpawn(cmdPath, cmdArgs, { stdio: standardOutput, detached: false });
    coreProcess.on('close', (code, signal) => {
      Log.coreLogger.info(`[ee-core] [cross/run] [pid=${coreProcess.pid}, port=${confPort}] exited with code: ${code}, signal: ${signal}`);
      if (0 !== code) {
        // 弹错误窗口
        Log.coreLogger.error(`[ee-core] [cross/run] Please check [${cmdName}] service log !!!`);
      }

      // electron quit
      if (conf.appExit) {
        setTimeout(() => {
          // 进程退出前的一些清理工作
          electronApp.quit();
        }, 1000)
      }
    });
    this.children[cmdName] = coreProcess;
  },

  kill() {
    Object.keys(this.children).forEach(key => {
      let proc = this.children[key];
      if (proc) {
        proc.kill('SIGINT');
        setTimeout(() => {
          if (proc.killed) return;
          proc.kill('SIGKILL');
        }, 500)
      }
    });
  },

  getArgs(argv, key) {
    // parse args
    let value = UtilsPargv(argv);
    if (key) {
      value = value[key];
    }

    return value;
  },

  replaceValue(arr, key, value) {
    arr = arr.map(item => {
      if (item.startsWith(key)) {
          let newItem = key + value;
          return newItem;
      } else {
          return item;
      }
    });
    return arr;
  },

  getUrl(service) {
    const cfg = Conf.getValue('cross');
    const servicesCfg = cfg[service];

    const args = this.getArgs(servicesCfg.args);
    let protocol = 'http://';
    if (args.hasOwnProperty('ssl') && (args.ssl == 'true' || args.ssl == '1')) {
      protocol = 'https://';
    }
    const hostname = args.hostname ? args.hostname : '127.0.0.1';
    const url = protocol + hostname + ":" + args.port;

    return url;
  },

  _getCmdPath(name) {
    const coreName =  UtilsIs.windows() ? name + ".exe" : name;
    const p = path.join(Ps.getExtraResourcesDir(), coreName);
    return p;
  },

  /**
   * init path
   */  
  _initPath() {
    try {
      const pathname = Ps.getUserHomeConfigDir();
      if (!fs.existsSync(pathname)) {
        UtilsHelper.mkdir(pathname, {mode: 0o755});
      }
    } catch (e) {
      Log.coreLogger.error(e);
      throw new Error(`[ee-core] [cross] mkdir ${pathname} failed !`);
    }
  }    
}

module.exports = CrossLanguageService;
