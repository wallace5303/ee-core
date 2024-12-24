'use strict';

const { SqliteStorage } = require('./sqliteStorage'); 

function getSqliteDB(name, opt = {}) {
  const storage = new SqliteStorage(name, opt);
  return storage;
}

module.exports = {
  getSqliteDB,
  SqliteStorage
};