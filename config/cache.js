const Storage = require('../storage');
const EEConfigCache = Symbol('EeConfig#cache');
const CacheKeyAllConfig = 'allconfig';

const Cfg = {

  /**
   * 获取缓存
   */
  _getCache(key) {
    // 初始化
    if (!this[EEConfigCache]) {
      this[EEConfigCache] = new Map();
      console.log('_setCache 33333333 ', key);
    }

    // 检查缓存是否存在
    let value;
    if (this[EEConfigCache].has(key)) {
      value = this[EEConfigCache].get(key);
      console.log('_getCache 444444444 ', key);
      return value;
    }

    return null;
  },

  /**
   * 设置缓存
   */  
  _setCache(key, value, from = '') {
    // 初始化
    if (!this[EEConfigCache]) {
      this[EEConfigCache] = new Map();
      console.log('_setCache 111111111111');
    }
    // 清除所有缓存，避免关联的对象取到的还是旧数据
    this[EEConfigCache].clear();
    console.log('_setCache 222222 key: %s, %s', key, from);
    this[EEConfigCache].set(key, value);
  },

  /**
   * 获取 coredb
   */
  _getCoreDB() {
    const coreDB = Storage.connection('system');
    return coreDB;
  },

  /**
   * all
   */
  all() {
    const allConfig = this._getCache(CacheKeyAllConfig);
    if (allConfig) {
      return allConfig;
    }

    const cdb = this._getCoreDB();
    const config = cdb.getItem('config');

    // 设置缓存
    this._setCache(CacheKeyAllConfig, config, 'all-get');
  
    return config;
  },

  /**
   * setAll
   */
  setAll(value) {
    const cdb = this._getCoreDB();
    cdb.setItem('config', value);

    // 设置缓存
    this._setCache(CacheKeyAllConfig, value, 'all-set');
  
    return;
  },

  /**
   * setValue
   */
  setValue(key, value) {
    const cdb = this._getCoreDB();
    cdb.setConfigItem(key, value);
  
    // 设置缓存
    this._setCache(key, value, 'setValue');

    return;
  },

  /**
   * getValue
   */
  getValue(key) {
    let cache = this._getCache(key);
    if (cache) {
      return cache;
    }

    const cdb = this._getCoreDB();
    let value = cdb.getConfigItem(key);

    // 设置缓存
    this._setCache(key, value, 'getValue');
  
    return value;
  },  
};

module.exports = Cfg;