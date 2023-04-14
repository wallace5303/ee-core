const Utils = require('../utils');
const EEApplication = Symbol('Ee#Application');

const EE = {

  /**
   * 兼容1.x版本api
   */
  get Application() {
    const appClass = require('./application');
    return appClass;
  },

  /**
   * 设置app对象
   */  
  set app(appObject) {
    if (!this[EEApplication]) {
      this[EEApplication] = appObject;
    }
  },

  /**
   * 获取app对象
   */  
  get app() {
    return this[EEApplication] || null;
  },

  /**
   * 是否加密
   */  
  isEncrypt(basePath) {
    return Utils.isEncrypt(basePath);
  },
}  

module.exports = EE;