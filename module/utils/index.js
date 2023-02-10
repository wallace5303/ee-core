/**
 * Utils
 */

const fs = require('fs');
const path = require('path');
const storage = require('../../lib/storage');

/**
 * 获取 coredb
 */
exports.getCoreDB = function() {
  const coreDB = storage.JsonDB.connection('system');
  return coreDB;
}

/**
 * 获取 当前环境
 */
exports.getEnv = function() {
  const cdb = this.getCoreDB();
  const env = cdb.getItem('config').env;

  return env;
}

/**
 * 获取 base目录
 */
exports.getBaseDir = function() {
  const cdb = this.getCoreDB();
  const basePath = cdb.getItem('config').baseDir;
  return basePath;
}

/**
 * fnDebounce
 * 
 * @param  {Function} fn - 回调函数
 * @param  {Time} delayTime - 延迟时间(ms)
 * @param  {Boolean} isImediate - 是否需要立即调用
 * @param  {type} args - 回调函数传入参数
*/
exports.fnDebounce = function() {
  const fnObject = {};
  let timer;

  return (fn, delayTime, isImediate, args) => {
    const setTimer = () => {
      timer = setTimeout(() => {
        fn(args);
        clearTimeout(timer);
        delete fnObject[fn];
      }, delayTime);

      fnObject[fn] = { delayTime, timer };
    };

    if (!delayTime || isImediate) return fn(args);

    if (fnObject[fn]) {
      clearTimeout(timer);
      setTimer(fn, delayTime, args);
    } else {
      setTimer(fn, delayTime, args);
    }
  };
}

/**
 * 随机10位字符串
 */
exports.getRandomString = function() {
  return Math.random().toString(36).substring(2);
};