'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const constant = require('../constant');
const Database = require('better-sqlite3')

class SqliteStorage {
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
  table (name, options = {}) {
    assert(name, 'table name is required');

    const db = new Database(name, options);

    //assert(fs.existsSync(dbFile), `error: storage ${dbFile} not exists`);

    return db;
  }

  /**
   * 获取db文件名
   */
  getFileName (name) {
    return name + ".db";
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
  }
  
  /**
   * 根据指定的名字 name 获取对应的值
   */
  getItem (key) {
  }   


}

module.exports = SqliteStorage;