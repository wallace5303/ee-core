const fs = require('fs');
const crossSpawn = require('cross-spawn');
const path = require('path');
const is = require('is-type-of');
const Conf = require('../config');
const UtilsHelper = require('../utils/helper');
const UtilsIs = require('../utils/is');
const UtilsPargv = require('../utils/pargv');
const Ps = require('../ps');
const Log = require('../log');
const GetPort = require('../utils/get-port');
const CoreElectronApp = require('../electron/app');

/**
 * Cross-language service
 * 跨语言服务
 */
const CrossLanguageService = {

  execProcess: {},

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
    const coreProcess = crossSpawn(cmdPath, cmdArgs, { stdio: 'inherit', detached: false });
    coreProcess.on('close', (code, signal) => {
      Log.coreLogger.info(`[ee-core] [cross/run] [pid=${coreProcess.pid}, port=${port}] exited with code: ${code}, signal: ${signal}`);
      if (0 !== code) {
        // 弹错误窗口
      }

      CoreElectronApp.quit();
    });
    this.execProcess[cmdName] = coreProcess;
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

  getUrl(argv) {
    const args = this.getArgs(argv);
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
