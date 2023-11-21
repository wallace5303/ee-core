const fs = require('fs');
const crossSpawn = require('cross-spawn');
const path = require('path');
const is = require('is-type-of');
const Conf = require('../config');
const UtilsHelper = require('../utils/helper');
const UtilsIs = require('../utils/is');
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
    await UtilsHelper.sleep(5 * 1000);

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
    const cmdArgs = is.string(conf.args) ? [conf.args] : conf.args;


    // 动态生成port
    // if (Ps.isProd() || this.workspaces.length > 0) {
    const port = await GetPort({ port: conf.port });
    cmdArgs.push("--port=" + port);

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
    this.execProcess[cmdName] = coreProcess

    // 使用 go 的 http 服务
    // const goServer = this.getServer() + "/build/app/index.html?v=" + new Date().getTime();
    // win.loadURL(goServer);
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
