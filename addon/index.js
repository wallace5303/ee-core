const EE = require('../ee');

const Addon = {

  /**
   * 获取 all addon instances
   */  
  all() {
    const { CoreApp } = EE;
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
 
  // get Addons() {
  //   const { CoreApp } = EE;
  //   const instances = CoreApp.addon || null;
  //   if (!instances) {
  //     throw new Error('Addons not exists, do not export properties directly at the top!');
  //   };
  //   return instances;
  // },
};

module.exports = Addon;