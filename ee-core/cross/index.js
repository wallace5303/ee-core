const fs = require('fs');
const EventEmitter = require('events');
const Conf = require('../config/cache');
const Helper = require('../utils/helper');
const Ps = require('../ps');
const SpawnProcess = require('./spawnProcess');
const Channel = require('../const/channel');
const extend = require('../utils/extend');
const GetPort = require('../utils/get-port');

/**
 * Cross-language service
 * 跨语言服务
 */
const CrossLanguageService = {

  emitter: undefined,

  /**
   * pid唯一
   * {pid:{name,entity}, pid:{name,entity}, ...}
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
    //await Helper.sleep(5 * 1000);

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
  _initEventEmitter() {
    if (this.emitter) {
      return
    }
    this.emitter = new EventEmitter();  
    this.emitter.on(Channel.events.childProcessExit, (data) => {
      const child = this.children[data.pid];
      delete this.childrenMap[child.name];
      delete this.children[data.pid];
    });
    this.emitter.on(Channel.events.childProcessError, (data) => {
      const child = this.children[data.pid];
      delete this.childrenMap[child.name];
      delete this.children[data.pid];
    });
  },

  /**
   * run
   */
  async run(service, opt = {}) {
    // init dir
    this._initPath();

    const allConfig = Conf.all();
    const defaultOpt = allConfig.cross[service] || {};
    const targetConf = extend(true, {}, defaultOpt, opt);
    if (Object.keys(targetConf).length == 0) {
      throw new Error(`[ee-core] [cross] The service [${service}] config does not exit`);
    }

    // eventEmitter
    this._initEventEmitter();
    
    // format params
    let tmpArgs = targetConf.args;
    let confPort = parseInt(Helper.getValueFromArgv(tmpArgs, 'port'));
    // 某些程序给它传入不存在的参数时会报错
    if (isNaN(confPort) && targetConf.port > 0) {
      confPort = targetConf.port;
    }
    if (confPort > 0) {
      // 动态生成port，传入的端口必须为int
      confPort = await GetPort({ port: confPort });
      // 替换port
      targetConf.args = Helper.replaceArgsValue(tmpArgs, "port", String(confPort));
    }

    // 创建进程
    const subProcess = new SpawnProcess(this, { targetConf, port: confPort });
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
    Object.keys(this.children).forEach(pid => {
      this.kill(pid)
    });
  },

  kill(pid) {
    const entity = this.getProc(pid);
    if (entity) {
      entity.kill();
    }
  },

  killByName(name) {
    const entity = this.getProcByName(name);
    if (entity) {
      entity.kill();
    }
  },

  getUrl(name) {
    const entity = this.getProcByName(name);
    const url = entity.getUrl();

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

  /**
   * init path
   */  
  _initPath() {
    const pathname = Ps.getUserHomeConfigDir();
    if (!fs.existsSync(pathname)) {
      Helper.mkdir(pathname, {mode: 0o755});
    }
  },

}

module.exports = CrossLanguageService;
