const EEAddon = Symbol('Ee#Addon');

/**
 * todo 插件模块
 */ 
const Addon = {

  /**
   * 设置插件对象
   */  
  setAddonObject(name, obj) {
    if (!this[EEAddon]) {
      this[EEAddon] = new Map();
    }

    if (!this[EEAddon].has(name)) {
      this[EEAddon].set(name, obj);
    }
  },

  /**
   * 获取插件对象
   */  
  get(name) {
    let addon = this[EEAddon].has(name) ? this[EEAddon].get(name): null;
    return addon;
  },  
}  

module.exports = Addon;