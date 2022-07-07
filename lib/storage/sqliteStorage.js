'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const constant = require('../constant');
const Database = require('better-sqlite3');
const utilsCommon = require('../../utils/common');

class SqliteStorage {
  constructor (name, opt = {}) {
    assert(name, `db name ${name} Cannot be empty`);

    this.name = name;

    // 数据库key列表
    this.storageKey = constant.storageKey;

    const storageDir = utilsCommon.getStorageDir();
    if (!fs.existsSync(storageDir)) {
      utilsCommon.mkdir(storageDir);
      utilsCommon.chmodPath(storageDir, '777');
    }

    this.db = this.initDB(name, opt);
  }

  /**
   * 初始化db
   */
  initDB (name, opt = {}) {
    let options = Object.assign({
      timeout: 5000,
      verbose: console.log
    }, opt);

    // 存储类型：db文件、内存(:memory:)
    let isFileDB = false;
    if (path.extname(name) == '.db') {
      name = this.getFilePath(name);
      isFileDB = true;
    }
    const db = new Database(name, options);

    // 如果是文件类型，判断文件是否创建成功
    if (isFileDB) {
      assert(fs.existsSync(dbFile), `error: storage ${dbFile} not exists`);
    }

    return db;
  }

  /**
   * 获取文件绝对路径
   */
  getFilePath (name) {
    const storageDir = utilsCommon.getStorageDir();
    const dbFile = path.join(storageDir, name);
    return dbFile;
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