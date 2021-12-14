'use strict';

const path = require('path');
const dayjs = require('dayjs');
const storage = require('./lib/storage');

const sysConfig = {
  log: {
    file: {
      fileName: path.normalize(storage.getStorageDir() + 'logs/electron-' + dayjs().format('YYYY-MM-DD') + '.log'),
    }
  },
}

exports.get = function (flag = '', env = 'prod') {

  // TODO
  let config = {};
  let userConfig = require('../../electron/config');
  Object.assign(config, userConfig, sysConfig);

  if (flag === 'egg') {
    const eggConfig = storage.getEggConfig();
    if (env === 'prod' && eggConfig.port) {
      config.egg.port = eggConfig.port;
    }
    return config.egg;
  }

  if (flag in config) {
    return config[flag];
  }

  return {};
};

exports = module.exports;
