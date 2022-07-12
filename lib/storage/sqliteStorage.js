'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const utilsCommon = require('../../utils/common');

class SqliteStorage {
  constructor (name, opt = {}) {
    assert(name, `db name ${name} Cannot be empty`);

    this.name = name;

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
      assert(fs.existsSync(name), `error: storage ${name} not exists`);
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
}

module.exports = SqliteStorage;