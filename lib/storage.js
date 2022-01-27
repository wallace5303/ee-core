'use strict';

const assert = require('assert');
const path = require('path');
const lowdb = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const fs = require('fs');
const getPort = require('get-port');
const utils = require('ee-core/utils');
const _ = require('lodash');
const constant = require('./constant');
const logger = require('./logger').getInstance();

class Storage {
  constructor (name, opt = {}) {
    assert(name, `db name ${name} Cannot be empty`);

    logger.coreLogger.info('[ee-core:storage] loaded storage');

    this.dbs = {};

    this.initDb(name);

    // 数据库key列表
    this.storageKey = constant.storageKey;
  }

  /**
   * 单例
   * @param {String} name dbname
   * @param {Object} opt type:"framework|app", 
   */
  static getInstance (name, opt = {}) {
    if (typeof this.instance === 'object') {
      return this.instance;
    }
    this.instance = new Storage(name, opt);
    return this.instance;
  }

  /**
   * 初始化模块
   */
  initDb (dbName) {
    const dbFile = this.getFilePath(dbName);

    // 检查文件是否存在
    if (!fs.existsSync(dbFile)) {
      const storageDir = this.getStorageDir();
      utils.mkdir(storageDir);
      utils.chmodPath(storageDir, '777');
    }
  
    this.createDb(dbName);

    return;
  }

  /**
   * 创建db
   */
  createDb (name) {
    assert(name, 'db name is required');

    const dbFile = this.getFilePath(name);
    const adapter = new FileSync(dbFile);
    const db = lowdb(adapter);

    assert(fs.existsSync(dbFile), `storage ${dbFile} not exists`);

    this.dbs[name] = db;

    return db;
  }

  /**
   * 获取DB对象
   */
  getDb (name) {
    return this.dbs[name] || null;
  }

  /**
   * 获取db文件名
   */
  getFileName (name) {
    return name + ".json";
  }

  /**
   * 获取db文件名
   */
  getFilePath (name) {
    const storageDir = this.getStorageDir();
    const dbFile = path.join(storageDir, this.getFileName(name));
    return dbFile;
  }

  /**
   * 获取egg配置
   */
  getEggConfig () {
    const key = this.storageKey.egg_config;
    const res = this.db
    .get(key)
    .value();
  
    return res;
  }

  /**
   * 设置egg动态端口
   */
  async setEggDynamicPort () {
    const key = this.storageKey.egg_config + '.port';
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
    const key = this.storageKey.electron_ipc + '.port';
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
    const key = this.storageKey.preferences;
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
    const key = this.storageKey.preferences + '.shortcuts';
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

module.exports = Storage;