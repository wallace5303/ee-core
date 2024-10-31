const assert = require('assert');
const _ = require('lodash');
const DB = {};

// jsondb 要么每次new对象，要么所有地方都用同一个实例，否则会出现数据无法刷新的情况

DB.connection = function (database, options = {}) {
  let driver = options.driver || 'jsondb';
  
  // 兼容之前api
  driver = driver == 'lowdb' ? 'jsondb' : driver;

  let opt = options.default || {};
  if (!_.includes(['jsondb', 'sqlite'], driver)) {
    assert(database, `db driver ${driver} is not supported`);
  }
  if (_.isEmpty(database)) {
    assert(database, `db name ${database} Cannot be empty`);
  }
  let storage;
  switch (driver)  {
    case 'jsondb':
      const JsondbStorage = require('./jsondbStorage');
      storage = new JsondbStorage(database);
      break;
    case 'sqlite':
      const SqliteStorage = require('./sqliteStorage');
      storage = new SqliteStorage(database, opt);
      break;
    default:
  }

  return storage;
}

// 兼容之前的api
DB.JsonDB = DB;

module.exports = DB;