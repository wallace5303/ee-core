const Utils = require('../utils');
const EEApplication = Symbol('Ee#Application');
const BuiltInApp = Symbol('Ee#BuiltInApp');

/**
 * EE
 */
const EE = {

  /**
   * 兼容1.x版本api
   */
  get Application() {
    const appClass = require('./application');
    return appClass;
  },

  /**
   * 设置实例化app对象
   */  
  set app(appObject) {
    if (!this[EEApplication]) {
      this[EEApplication] = appObject;
    }
  },

  /**
   * 获取实例化app对象
   */  
  get app() {
    return this[EEApplication] || null;
  },

  /**
   * 设置全局this到CoreApp (eeApp)
   */  
  set CoreApp(obj) {
    if (!this[BuiltInApp]) {
      this[BuiltInApp] = obj;
    }
  },

  /**
   * 获取 CoreApp (eeApp)
   */  
  get CoreApp() {
    return this[BuiltInApp] || null;
  },

  /**
   * 是否加密
   */  
  isEncrypt(basePath) {
    return Utils.isEncrypt(basePath);
  },
}  

module.exports = EE;