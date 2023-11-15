const fs = require('fs');
const Conf = require('../config');
const UtilsHelper = require('../utils/helper');
const Ps = require('../ps');
const Log = require('../log');

/**
 * Cross-language service
 * 跨语言服务
 */
const CrossLanguageService = {

  /**
   * create
   */
  async create() {

    // init dir
    this._initPath();

    // boot services
    const servicesCfg = Conf.getValue('cross');
    for (let key of Object.keys(servicesCfg)) {
      let cfg = servicesCfg[key];
      if (cfg.auto == true) {
        this.run(cfg)
      }
    }
  

  },

  /**
   * run
   */
  run(config = {}) {

 
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
