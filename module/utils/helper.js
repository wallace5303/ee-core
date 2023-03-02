const fs = require('fs');
const mkdirp = require('mkdirp');
const convert = require('koa-convert');
const is = require('is-type-of');
const co = require('co');

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

/**
 * 创建文件夹
 */
exports.mkdir = function(filepath, opt = {}) {
  mkdirp.sync(filepath, opt);
  return
}

/**
 * 修改文件权限
 */
exports.chmodPath = function(path, mode) {
  let files = [];
  if (fs.existsSync(path)) {
    files = fs.readdirSync(path);
    files.forEach((file, index) => {
      const curPath = path + '/' + file;
      if (fs.statSync(curPath).isDirectory()) {
        this.chmodPath(curPath, mode); // 递归删除文件夹
      } else {
        fs.chmodSync(curPath, mode);
      }
    });
    fs.chmodSync(path, mode);
  }
};

/**
 * 版本号比较
 */
exports.compareVersion = function (v1, v2) {
  v1 = v1.split('.')
  v2 = v2.split('.')
  const len = Math.max(v1.length, v2.length)

  while (v1.length < len) {
    v1.push('0')
  }
  while (v2.length < len) {
    v2.push('0')
  }
  
  for (let i = 0; i < len; i++) {
    const num1 = parseInt(v1[i])
    const num2 = parseInt(v2[i])

    if (num1 > num2) {
      return 1
    } else if (num1 < num2) {
      return -1
    }
  }

  return 0
}

/**
 * 执行一个函数
 */
exports.callFn = async function (fn, args, ctx) {
  args = args || [];
  if (!is.function(fn)) return;
  if (is.generatorFunction(fn)) fn = co.wrap(fn);
  return ctx ? fn.call(ctx, ...args) : fn(...args);
}

exports.middleware = function (fn) {
  return is.generatorFunction(fn) ? convert(fn) : fn;
}
