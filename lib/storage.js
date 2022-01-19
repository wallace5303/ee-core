'use strict';

const path = require('path');
const lowdb = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const fs = require('fs');
const getPort = require('get-port');
const utils = require('ee-core/utils');
const _ = require('lodash');
const storageDb = 'db.json';

class Storage {
  constructor () {

    // 数据库key列表
    this.storageKey = {
      EGG_CONFIG: 'egg_config',
      ELECTRON_IPC: 'electron_ipc',
      PREFERENCES: 'preferences'
    }
  }

  /**
   * 单例
   */
  static getInstance () {
    if (typeof this.instance === 'object') {
      return this.instance;
    }
    this.instance = new Storage();
    return this.instance;
  }

  /**
   * 初始化模块
   */
  init () {
    console.log('[ee-core] [lib-storage] [init]');
    const storageDir = this.getStorageDir();
    if (!fs.existsSync(storageDir)) {
      utils.mkdir(storageDir);
      utils.chmodPath(storageDir, '777');
    }
    const file = storageDir + storageDb;
    const adapter = new FileSync(file);
    const db = lowdb(adapter);
    const eggConfigKey = this.storageKey.EGG_CONFIG;
    if (!db.has(eggConfigKey).value()) {
      db.set(eggConfigKey, {}).write();
    }
  }

  /**
   * 获取DB对象
   */
  db (file = null) {
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
    const key = this.storageKey.EGG_CONFIG;
    const res = this.db()
    .get(key)
    .value();
  
    return res;
  }

  /**
   * 设置动态端口
   */
  async setDynamicPort () {
    const dynamicPort = await getPort();
    const key = this.storageKey.EGG_CONFIG + '.port';
    const res = this.db()
      .set(key, dynamicPort)
      .write();
    
    return res;
  }

  /**
   * 设置IPC动态端口
   */
  async setIpcDynamicPort () {
    const key = this.storageKey.ELECTRON_IPC + '.port';
    const dynamicPort = await getPort();
    this.db()
      .set(key, dynamicPort)
      .write();
    
    return dynamicPort;
  }

  /**
   * 获取数据存储路径
   */
  getStorageDir () {
    return utils.getStorageDir();
  }

  /**
   * 初始化功能模块数据
   */
  iniPreferences () {
    const key = this.storageKey.PREFERENCES;
    if (!this.db().has(key).value()) {
      this.db().set(key, {}).write();
    }
    const res = this.db()
    .get(key)
    .value();
  
    return res;
  }

  /**
   * 设置快捷键
   */
  setShortcuts (data) {
    const key = this.storageKey.PREFERENCES + '.shortcuts';
    if (!this.db().has(key).value()) {
      this.db().set(key, []).write();
    }
    const item = this.db().get(key).find({id: data.id}).value();
    if (_.isEmpty(item)) {
      this.db()
      .get(key)
      .push(data)
      .write();
    } else {
      this.db()
      .get(key)
      .find({id: data.id})
      .assign(data)
      .write();
    }
  
    return true;
  }
}

module.exports = Storage.getInstance();