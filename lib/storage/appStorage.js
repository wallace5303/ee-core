'use strict';

class AppStorage  {
  constructor() {
    const Storage = require('./storage');
    const sObj = Storage.getInstance('appData');

    for (const attr of sObj) {
      Object.assign(UserStorage.prototype, attr);
    }
  }
}

module.exports = AppStorage;