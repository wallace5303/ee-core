'use strict';

const ConfigCache = require('./cache');

/**
 * all
 */
function all(fromCache = true) {
  if (fromCache === true) {
    // 如果子进程
    const cacheValue = ConfigCache.all();
    return cacheValue;
  }
  const config = getAllFromFile('config');

  return config;
}

/**
 * getValue
 */
function getValue(key, fromCache = true) {
  if (fromCache === true) {
    const cacheValue = ConfigCache.getValue(key);
    return cacheValue;
  }
  const v = getValueFromFile(key);

  return v;
}  

/**
 * getValueFromFile
 */
function getValueFromFile(key) {
  return ''
}

/**
 * getValueFromFile
 */
function getAllFromFile(key) {
  return ''
}

module.exports = {
  all,
  getValue,
  getValueFromFile,
  getAllFromFile,
};