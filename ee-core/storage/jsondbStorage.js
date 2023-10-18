const assert = require('assert');
const fs = require('fs');
const path = require('path');
const Jsondb = require('./jsondb/main');
const FileSync = require('./jsondb/adapters/FileSync');
const _ = require('lodash');
const Constants = require('../const');
const Helper = require('../utils/helper');
const Ps = require('../ps');

class JsondbStorage {
  constructor (name, opt = {}) {
    assert(name, `db name ${name} Cannot be empty`);

    // 补全文件名
    name = this._addExtname(name);
    this.name = name;
    this.mode = this.getMode(name);
    this.storageDir = this._createStorageDir();
    this.fileName = this._formatFileName(name);
    this.storageKey = Constants.storageKey;

    this.db = this.table();
  }

  /**
   * 创建 table
   */
  table() {
    const dbFile = this.getFilePath();
    const isSysDB = this.isSystemDB();
    const opt = {
      source: dbFile,
      isSysDB: isSysDB
    }
    const adapter = new FileSync(opt);
    const db = Jsondb(adapter);

    assert(fs.existsSync(dbFile), `error: storage ${dbFile} not exists`);

    return db;
  }

  /** 
   * 补全扩展名
   */
  _addExtname(name) {
    if (path.extname(name) != '.json') {
      name += ".json";
    }

    return name;
  }

  /**
   * 创建storage目录
   */
  _createStorageDir() {
    let storageDir = Ps.getStorageDir();

    if (this.mode == 'absolute') {
      storageDir = path.dirname(this.name); 
    }

    if (!fs.existsSync(storageDir)) {
      Helper.mkdir(storageDir);
      Helper.chmodPath(storageDir, '777');
    }

    return storageDir;
  }

  /**
   * 获取文件名
   */
  _formatFileName(name) {
    let fileName = path.basename(name);
    return fileName;
  }

  /**
   * is system db
   */
  isSystemDB() {
    return (this.name == 'system.json') ? true : false;
  }

  /**
   * 获取文件绝对路径
   */
  getFilePath() {
    const dbFile = path.join(this.storageDir, this.fileName);
    return dbFile;
  }

  /**
   * 获取file path 模式
   */
  getMode(name) {
    let mode = 'relative';

    // 路径模式
    name = name.replace(/[/\\]/g, '/');
    if (name.indexOf('/') !== -1) {
      const isAbsolute = path.isAbsolute(name);
      if (isAbsolute) {
        mode = 'absolute';
      }
    }

    return mode;
  }

  /**
   * 获取storage目录
   */
  getStorageDir() {
    return this.storageDir;
  }  

  /**
   * 为指定的 name 设置一个对应的值
   */
  setItem (key, value) {
    assert(_.isString(key), `key must be a string`);
    assert(key.length != 0, `key cannot be empty`);
    assert(!this.storageKey.hasOwnProperty(key), `${key} is not allowed`);

    let cacheKey = this.storageKey.cache;
    if (!this.db.has(cacheKey).value()) {
      this.db.set(cacheKey, {}).write();
    }

    let keyId = cacheKey + "." + key; 
    this.db
      .set(keyId, value)
      .write();
  
    return true;
  }
  
  /**
   * 根据指定的名字 name 获取对应的值
   */
  getItem (key) {
    assert(_.isString(key), `key must be a string`);
    assert(key.length != 0, `key cannot be empty`);

    let cacheKey = this.storageKey.cache;
    let keyId = cacheKey + "." + key; 
    const data = this.db
      .get(keyId)
      .value();
  
    return data;
  }

  /**
   * 设置config对象key属性的值
   */
  setConfigItem (key, value) {
    assert(_.isString(key), `key must be a string`);
    assert(key.length != 0, `key cannot be empty`);
    assert(!this.storageKey.hasOwnProperty(key), `${key} is not allowed`);

    let cacheKey = this.storageKey.cacheConfig;
    if (!this.db.has(cacheKey).value()) {
      this.db.set(cacheKey, {}).write();
    }

    let keyId = cacheKey + "." + key; 
    this.db
      .set(keyId, value)
      .write();
  
    return true;
  }
  
  /**
   * 获取config对象key属性的值
   */
  getConfigItem (key) {
    assert(_.isString(key), `key must be a string`);
    assert(key.length != 0, `key cannot be empty`);

    let cacheKey = this.storageKey.cacheConfig;
    let keyId = cacheKey + "." + key; 
    const data = this.db
      .get(keyId)
      .value();
  
    return data;
  }   
}

module.exports = JsondbStorage;