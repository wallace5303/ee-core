'use strict';

const debug = require('debug')('ee-core:storage');
const path = require('path');
const lowdb = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const fs = require('fs');
const getPort = require('get-port');
const utils = require('ee-core/utils');
const _ = require('lodash');
const storageDb = 'db.json';
const constant = require('./constant');

class Storage {
  constructor () {

    // 数据库key列表
    this.storageKey = constant.storageKey;

    // db 
    this.db = getDb();
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
    debug('Loaded storage');
    const storageDir = this.getStorageDir();
    if (!fs.existsSync(storageDir)) {
      utils.mkdir(storageDir);
      utils.chmodPath(storageDir, '777');
    }
    // const file = path.join(storageDir, storageDb);
    // const adapter = new FileSync(file);
    // const db = lowdb(adapter);
    // const eggConfigKey = this.storageKey.EGG_CONFIG;
    // if (!db.has(eggConfigKey).value()) {
    //   db.set(eggConfigKey, {}).write();
    // }
  }

  /**
   * 获取DB对象
   */
  getDb (file = null) {
    if (!file) {
      const storageDir = this.getStorageDir();
      file = path.join(storageDir, storageDb);
    }

    assert(fs.existsSync(file), `storage ${file} not exists`);
  
    const adapter = new FileSync(file);
    const db = lowdb(adapter);
  
    return db;
  }

  /**
   * 获取egg配置
   */
  getEggConfig () {
    const key = this.storageKey.EGG_CONFIG;
    const res = this.db
    .get(key)
    .value();
  
    return res;
  }

  /**
   * 设置egg动态端口
   */
  async setEggDynamicPort () {
    const key = this.storageKey.EGG_CONFIG + '.port';
    if (!this.db.has(key).value()) {
      this.db.set(key, {}).write();
    }

    const dynamicPort = await getPort();
    const res = this.db
      .set(key, dynamicPort)
      .write();
    
    process.env.EE_EGG_PORT = dynamicPort;

    return res;
  }

  /**
   * 设置IPC动态端口
   */
  async setIpcDynamicPort () {
    const key = this.storageKey.ELECTRON_IPC + '.port';
    if (!this.db.has(key).value()) {
      this.db.set(key, {}).write();
    }

    const dynamicPort = await getPort();
    this.db
      .set(key, dynamicPort)
      .write();
    
    process.env.EE_IPC_PORT = dynamicPort;

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
    if (!this.db.has(key).value()) {
      this.db.set(key, {}).write();
    }
    const res = this.db
    .get(key)
    .value();
  
    return res;
  }

  /**
   * 设置快捷键
   */
  setShortcuts (data) {
    const key = this.storageKey.PREFERENCES + '.shortcuts';
    if (!this.db.has(key).value()) {
      this.db.set(key, []).write();
    }
    
    const item = this.db.get(key).find({id: data.id}).value();
    if (_.isEmpty(item)) {
      this.db
      .get(key)
      .push(data)
      .write();
    } else {
      this.db
      .get(key)
      .find({id: data.id})
      .assign(data)
      .write();
    }
  
    return true;
  }
}

module.exports = Storage.getInstance();