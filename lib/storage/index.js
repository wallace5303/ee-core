'use strict';

const assert = require('assert');
const _ = require('lodash');
const JsonDB = {};

JsonDB.connection = function (database, options = {}) {
  let driver = options.driver || 'lowdb';
  let opt = options.default || {};
  if (!_.includes(['lowdb', 'sqlite'], driver)) {
    assert(database, `db driver ${driver} is not supported`);
  }
  if (_.isEmpty(database)) {
    assert(database, `db name ${database} Cannot be empty`);
  }
  let storage;
  switch (driver)  {
    case 'lowdb':
      const LowdbStorage = require('./lowdbStorage');
      storage = new LowdbStorage(database);
      break;
    case 'sqlite':
      const SqliteStorage = require('./sqliteStorage');
      storage = new SqliteStorage(database, opt);
      break;
    default:  
  }

  return storage;
}

module.exports = {
  JsonDB
};