const EEApplication = Symbol('Ee#Application');

const eeApp = {

  /**
   * 获取app对象
   */
  getApp () {
    if (!this[EEApplication]) {
      this[EEApplication] = require('./application');
    }

    return this[EEApplication] || null;
  },

  /**
   * 兼容1.x版本api
   */
  get Appliaction() {
    return this.getApp();
  },

  get app() {
    return this.getApp();
  },  
}  

module.exports = eeApp;