'use strict';

const assert = require('assert');
const _ = require('lodash');
const JsonDB = {};

JsonDB.connection = function (database, type = 'lowdb') {
  // todo sqlite
  if (!_.includes(['lowdb'], type)) {
    assert(database, `db type ${type} is not supported`);
  }
  if (_.isEmpty(database)) {
    assert(database, `db name ${database} Cannot be empty`);
  }
  let storage;
  switch (type)  {
    case 'lowdb':
      const LowdbStorage = require('./lowdbStorage');
      storage = new LowdbStorage(database);
      break;
    case 'sqlite':
      // todo
      // const SqliteStorage = require('./sqliteStorage');
      // storage = new SqliteStorage(database);
      break;
    default:  
  }

  return storage;
}

module.exports = {
  JsonDB
};