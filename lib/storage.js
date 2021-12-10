'use strict';

const path = require('path');
const lowdb = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const fs = require('fs');
const getPort = require('get-port');
const utils = require('./utils');
const storageKey = require('../../app/const/storageKey');
const os = require('os');
const pkg = require('../../package.json');
const storageDb = 'db.json';
const _ = require('lodash');

class Storage {
  constructor () {

  }

  /**
   * 单例
   */
  static getIntance () {
    if (typeof Storage.instance === 'object') {
      Storage.instance = new Storage();
    }
    return Storage.instance;
  }

  /**
   * 安装模块
   */
  setup () {
    console.log('[ee-core] [lib-storage] [setup]');
    const storageDir = this.getStorageDir();
    if (!fs.existsSync(storageDir)) {
      utils.mkdir(storageDir);
      utils.chmodPath(storageDir, '777');
    }
    const file = storageDir + storageDb;
    const adapter = new FileSync(file);
    const db = lowdb(adapter);
    const eggConfigKey = storageKey.EGG_CONFIG;
    if (!db.has(eggConfigKey).value()) {
      db.set(eggConfigKey, {}).write();
    }
  }

  /**
   * 获取DB对象
   */
  getDB (file = null) {
    if (!file) {
      const storageDir = this.getStorageDir();
      file = path.normalize(storageDir + storageDb);
    }
    const isExist = fs.existsSync(file);
    if (!isExist) {
        return null;
    }
  
    const adapter = new FileSync(file);
    const db = lowdb(adapter);
  
    return db;
  }

  /**
   * 获取egg配置
   */
  getEggConfig () {
    const key = storageKey.EGG_CONFIG;
    const res = this.instance()
    .get(key)
    .value();
  
    return res;
  }

  /**
   * 设置动态端口
   */
  async setDynamicPort () {
    const dynamicPort = await getPort();
    const key = storageKey.EGG_CONFIG + '.port';
    const res = this.instance()
      .set(key, dynamicPort)
      .write();
    
    return res;
  }

  /**
   * 设置IPC动态端口
   */
  async setIpcDynamicPort () {
    const key = storageKey.ELECTRON_IPC + '.port';
    const dynamicPort = await getPort();
    this.instance()
      .set(key, dynamicPort)
      .write();
    
    return dynamicPort;
  }

  /**
   * 获取数据存储路径
   */
  getStorageDir () {
    const userHomeDir = os.userInfo().homedir;
    const storageDir = path.normalize(userHomeDir + '/' + pkg.name + '/');
  
    return storageDir;
  }

  iniPreferences () {
    const key = storageKey.PREFERENCES;
    if (!this.instance().has(key).value()) {
      this.instance().set(key, {}).write();
    }
    const res = this.instance()
    .get(key)
    .value();
  
    return res;
  }

  setShortcuts (data) {
    const key = storageKey.PREFERENCES + '.shortcuts';
    if (!this.instance().has(key).value()) {
      this.instance().set(key, []).write();
    }
    const item = this.instance().get(key).find({id: data.id}).value();
    if (_.isEmpty(item)) {
      this.instance()
      .get(key)
      .push(data)
      .write();
    } else {
      this.instance()
      .get(key)
      .find({id: data.id})
      .assign(data)
      .write();
    }
  
    return true;
  }
}

module.exports = Storage;