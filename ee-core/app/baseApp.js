const EeAppCore = require('../core/index').EeCore;
const AppLoader = require('./appLoader');
const Conf = require('../config');

class BaseApp extends EeAppCore {
  constructor (options = {}) {

    super(options);

    this.loader.loadConfig();
    
    
    // [todo] 缓存配置
    Conf.setAll(this.config);

    this.loader.load();

  }


}

module.exports = BaseApp;