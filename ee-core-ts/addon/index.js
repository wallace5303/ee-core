const EE = require('../ee');

const Addon = {

  /**
   * 获取 all addon instances
   */  
  all() {
    const { CoreApp } = EE;
    if (!CoreApp) {
      throw new Error('An unknown error or Addons cannot be used by the jobs!');
    }

    const instances = CoreApp.addon || null;
    if (!instances) {
      throw new Error('Addons not exists or do not call directly at the top!');
    };
    return instances;
  },

  /**
   * 获取 addon instance
   */  
  get(name) {
    const instances = this.all();
    const instance = instances[name] || null;
    if (!instance) {
      throw new Error(`Addon class '${name}' not exists or do not call directly at the top!`);
    };
    return instance;
  },
 
};

module.exports = Addon;