'use strict';

const path = require('path');
const dayjs = require('dayjs');
const storage = require('./storage');

const sysConfig = {
  log: {
    file: {
      fileName: path.normalize(storage.getStorageDir() + 'logs/electron-' + dayjs().format('YYYY-MM-DD') + '.log'),
    }
  },
}

// TODO
const config = {};
const userConfig = require('../../electron/config');
Object.assign(config, userConfig, sysConfig);

exports.get = function (flag = '', env = 'prod') {

  if (flag === 'egg') {
    if (env === 'prod') {
      const eggConfig = storage.getEggConfig();
      const port = parseInt(eggConfig.port);
      config.egg.port = port ? port : config.egg.port;
    }
    return config.egg;
  }

  if (flag in config) {
    return config[flag];
  }

  return {};
};

exports = module.exports;
