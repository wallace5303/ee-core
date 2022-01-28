'use strict';

const assert = require('assert');
const path = require('path');
const lowdb = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const fs = require('fs');
const utils = require('ee-core/utils');
const _ = require('lodash');
const constant = require('../constant');

class LowdbStorage {
  constructor (name, opt = {}) {
    assert(name, `db name ${name} Cannot be empty`);

    this.name = name;

    // 数据库key列表
    this.storageKey = constant.storageKey;

    const storageDir = this.getStorageDir();
    if (!fs.existsSync(storageDir)) {
      utils.mkdir(storageDir);
      utils.chmodPath(storageDir, '777');
    }

    this.db = this.createDb(name);
  }

  /**
   * 创建文件
   */
  initDbFile (dbName) {

    // 检查文件夹是否存在
    const storageDir = this.getStorageDir();
    if (!fs.existsSync(storageDir)) {
      utils.mkdir(storageDir);
      utils.chmodPath(storageDir, '777');
    }

    // const dbFile = this.getFilePath(dbName);
    // if (!dbFile) {
    //   this.createDb(dbName);
    // }

    // if (!this.db) {
    //   this.createDb(dbName);
    // }

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

    assert(fs.existsSync(dbFile), `error: storage ${dbFile} not exists`);

    //this.db = db;

    return db;
  }

  /**
   * 获取DB对象
   */
  getDb () {
    if (!this.db) {
      this.createDb(this.name);
    }

    return this.db;
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
  setEggDynamicPort (port) {
    const key = this.storageKey.egg_config + '.port';
    if (!this.db.has(key).value()) {
      this.db.set(key, {}).write();
    }

    const res = this.db
      .set(key, port)
      .write();
    
    process.env.EE_EGG_PORT = port;

    return res;
  }

  /**
   * 设置IPC动态端口
   */
  setIpcDynamicPort (port) {
    if (!port) {
      return;
    }
    const key = this.storageKey.electron_ipc + '.port';
    if (!this.db.has(key).value()) {
      this.db.set(key, {}).write();
    }

    this.db
      .set(key, port)
      .write();
    
    process.env.EE_IPC_PORT = port;

    return port;
  }

  /**
   * 获取数据存储路径
   */
  getStorageDir () {
    return utils.getStorageDir();
  }

  /**
   * 为指定的 name 设置一个对应的值
   */
  setItem (key, value) {
    assert(_.isString(key), `key must be a string`);
    assert(key.length != 0, `key cannot be empty`);
    assert(!this.storageKey.hasOwnProperty(key), `${key} is not allowed`);

    let cacheKey = 'cache';
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

    let cacheKey = 'cache';
    let keyId = cacheKey + "." + key; 
    const data = this.db
      .get(keyId)
      .value();
  
    return data;
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

module.exports = LowdbStorage;