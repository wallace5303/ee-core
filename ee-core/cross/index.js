const fs = require('fs');
const EventEmitter = require('events');
const path = require('path');
const is = require('is-type-of');
const Conf = require('../config/cache');
const UtilsHelper = require('../utils/helper');
const UtilsIs = require('../utils/is');
const UtilsPargv = require('../utils/pargv');
const Ps = require('../ps');
const Log = require('../log');
const GetPort = require('../utils/get-port');
const SpawnProcess = require('./spawnProcess');
const Channel = require('../const/channel');

/**
 * Cross-language service
 * 跨语言服务
 */
const CrossLanguageService = {

  crossEE: undefined,

  /**
   * pid唯一
   * {pid:{}, pid:{}, ...}
   */
  children: {},

  /**
   * name唯一
   * {name:pid, name:pid, ...}
   */
  childrenMap: {},

  /**
   * create
   */
  async create() {

    // boot services
    const servicesCfg = Conf.getValue('cross');
    //await UtilsHelper.sleep(5 * 1000);

    for (let key of Object.keys(servicesCfg)) {
      let cfg = servicesCfg[key];
      if (cfg.enable == true) {
        this.run(key)
      }
    }
  },

  /**
   * _initEventEmitter
   */
  async _initEventEmitter() {
    if (this.crossEE) {
      return
    }
    this.crossEE = new EventEmitter();  
    this.crossEE.on(Channel.events.childProcessExit, (data) => {
      const child = this.children[data.pid];
      delete this.childrenMap[child.name];
      delete this.children[data.pid];
    });
    this.crossEE.on(Channel.events.childProcessError, (data) => {
      const child = this.children[data.pid];
      delete this.childrenMap[child.name];
      delete this.children[data.pid];
    });
  },

  /**
   * run
   */
  async run(name) {
    // init dir
    this._initPath();

    const allConfig = Conf.all();
    const targetConf = Object.assign({}, allConfig.cross[name]);

    // eventEmitter
    this._initEventEmitter();
    
    let cmdPath = this._getCmdPath(targetConf.name);
    let cmdArgs = is.string(targetConf.args) ? [targetConf.args] : targetConf.args;
    if (targetConf.hasOwnProperty('cmd')) {
      cmdPath = targetConf.cmd;
    }

    let confPort = this.getValueFromArgs(cmdArgs, 'port');
    if (UtilsHelper.validValue(confPort)) {
      // 动态生成port
      confPort = await GetPort({ port: confPort });
      // 替换port
      cmdArgs = this.replaceValue(cmdArgs, "--port=", confPort)
      targetConf.args = cmdArgs;
    }

    Log.coreLogger.info(`[ee-core] [cross/run] cmd: ${cmdPath}, args: ${cmdArgs}`);

    // 创建进程
    const subProcess = new SpawnProcess(this, { cmdPath, cmdArgs, targetConf });
    let uniqueName = targetConf.name;
    if (this.childrenMap.hasOwnProperty(uniqueName)) {
      uniqueName = uniqueName + "-" + String(subProcess.pid);
    }
    this.childrenMap[uniqueName] = subProcess.pid;
    subProcess.name = uniqueName;
    this.children[subProcess.pid] = {
      name: uniqueName,
      entity: subProcess
    };

    return subProcess;
  },

  killAll() {
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

  getValueFromArgs(argv, key) {
    // parse args
    const argsObj = UtilsPargv(argv);
    const value = argsObj[key];

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

  getUrl(name) {
    const entity = this.getProcByName(name);
    const args = entity.getArgsObj();
    let protocol = 'http://';
    if (args.hasOwnProperty('ssl') && (args.ssl == 'true' || args.ssl == '1')) {
      protocol = 'https://';
    }
    const hostname = args.hostname ? args.hostname : '127.0.0.1';
    const url = protocol + hostname + ":" + args.port;

    return url;
  },

  // 获取 proc
  getProcByName(name) {
    const pid = this.childrenMap[name];
    if (!pid) {
      throw new Error(`[ee-core] [cross] The process named [${name}] does not exit`);
    }
    const entity = this.getProc(pid);

    return entity;
  },

  // 获取 proc
  getProc(pid) {
    const child = this.children[pid];
    if (!pid) {
      throw new Error(`[ee-core] [cross] The process pid [${pid}] does not exit`);
    }

    return child.entity;
  },  

  /**
   * 获取pids
   */  
  getPids() {
    let pids = Object.keys(this.children);
    return pids;
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
    const pathname = Ps.getUserHomeConfigDir();
    if (!fs.existsSync(pathname)) {
      UtilsHelper.mkdir(pathname, {mode: 0o755});
    }
  }    
}

module.exports = CrossLanguageService;
