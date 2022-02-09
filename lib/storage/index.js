'use strict';

const JsonDB = {};

JsonDB.connection = function (database) {

  // console.log('this::::::', this);
  // todo
  // if (typeof this.instance === 'object') {
  //   return this.instance;
  // }

  const LowdbStorage = require('./lowdbStorage');
  const storage = new LowdbStorage(database);

  // this.instance = storage;
  return storage;
}

module.exports = {
  JsonDB
};