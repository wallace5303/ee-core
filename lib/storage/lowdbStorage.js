'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const lowdb = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
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
      this.mkdir(storageDir);
      this.chmodPath(storageDir, '777');
    }

    this.db = this.table(name);
  }

  /**
   * 创建 table
   */
  table (name) {
    assert(name, 'table name is required');

    const dbFile = this.getFilePath(name);
    const adapter = new FileSync(dbFile);
    const db = lowdb(adapter);

    assert(fs.existsSync(dbFile), `error: storage ${dbFile} not exists`);

    return db;
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
   * 获取数据存储路径
   */
  getStorageDir () {
    let env = process.env.EE_SERVER_ENV;
    const appDir = env === 'local' || env === 'unittest' ? process.env.EE_HOME : process.env.EE_APP_USER_DATA;
    const storageDir = path.join(appDir, 'data');
    return storageDir;
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

  mkdir (dirpath, dirname) {
    if (typeof dirname === 'undefined') {
      if (fs.existsSync(dirpath)) {
        return;
      }
      this.mkdir(dirpath, path.dirname(dirpath));
    } else {
      if (dirname !== path.dirname(dirpath)) {
        this.mkdir(dirpath);
        return;
      }
      if (fs.existsSync(dirname)) {
        fs.mkdirSync(dirpath);
      } else {
        this.mkdir(dirname, path.dirname(dirname));
        fs.mkdirSync(dirpath);
      }
    }
  };
  
  chmodPath (path, mode) {
    let files = [];
    if (fs.existsSync(path)) {
      files = fs.readdirSync(path);
      files.forEach((file, index) => {
        const curPath = path + '/' + file;
        if (fs.statSync(curPath).isDirectory()) {
          this.chmodPath(curPath, mode);
        } else {
          fs.chmodSync(curPath, mode);
        }
      });
      fs.chmodSync(path, mode);
    }
  };
}

module.exports = LowdbStorage;