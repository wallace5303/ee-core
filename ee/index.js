const EEApplication = Symbol('Ee#Application');

const EE = {

  /**
   * 兼容1.x版本api
   */
  get Appliaction() {
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
}  

module.exports = EE;