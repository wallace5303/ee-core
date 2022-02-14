'use strict';

const path = require('path');
const is = require('is-type-of');
const utility = require('utility');
const utils = require('../../utils');
const FULLPATH = require('../file_loader').FULLPATH;

module.exports = {

  /**
   * Load app/ipc
   * @param {Object} opt - LoaderOptions
   * @since 1.0.0
   */
  loadIpc(opt) {
    this.timing.start('Load Ipc');
    opt = Object.assign({
      caseStyle: 'lower',
      directory: path.join(this.options.baseDir, 'ipc'),
      initializer: (obj, opt) => {
        if (is.function(obj) && !is.generatorFunction(obj) && !is.class(obj) && !is.asyncFunction(obj)) {
          obj = obj(this.app);
        }
        if (is.class(obj)) {
          obj.prototype.pathName = opt.pathName;
          obj.prototype.fullPath = opt.path;
          return wrapClass(obj);
        }
        if (is.object(obj)) {
          return wrapObject(obj, opt.path);
        }
        // support generatorFunction for forward compatbility
        if (is.generatorFunction(obj) || is.asyncFunction(obj)) {
          return wrapObject({ 'module.exports': obj }, opt.path)['module.exports'];
        }
        return obj;
      },
    }, opt);
    const ipcBase = opt.directory;

    this.loadToApp(ipcBase, 'ipc');
    this.options.logger.info('[egg:loader] Ipc loaded: %s', ipcBase);
    this.timing.end('Load Ipc');
  },

};

// wrap the class, yield a object with middlewares
function wrapClass(Ipc) {
  let proto = Ipc.prototype;
  const ret = {};
  // tracing the prototype chain
  while (proto !== Object.prototype) {
    const keys = Object.getOwnPropertyNames(proto);
    for (const key of keys) {
      // getOwnPropertyNames will return constructor
      // that should be ignored
      if (key === 'constructor') {
        continue;
      }
      // skip getter, setter & non-function properties
      const d = Object.getOwnPropertyDescriptor(proto, key);
      // prevent to override sub method
      if (is.function(d.value) && !ret.hasOwnProperty(key)) {
        ret[key] = methodToMiddleware(Ipc, key, opt);
        ret[key][FULLPATH] = Ipc.prototype.fullPath + '#' + Ipc.name + '.' + key + '()';
      }
    }
    proto = Object.getPrototypeOf(proto);
  }
  return ret;

  function methodToMiddleware(Ipc, key) {
    return function classIpcMiddleware(...args) {
      const ipc = new Ipc(this);
      return utils.callFn(ipc[key], args, ipc);
    };
  }
}

// wrap the method of the object, method can receive ctx as it's first argument
function wrapObject(obj, path, prefix) {
  const keys = Object.keys(obj);
  const ret = {};
  for (const key of keys) {
    if (is.function(obj[key])) {
      const names = utility.getParamNames(obj[key]);
      if (names[0] === 'next') {
        throw new Error(`ipc \`${prefix || ''}${key}\` should not use next as argument from file ${path}`);
      }
      ret[key] = functionToMiddleware(obj[key]);
      ret[key][FULLPATH] = `${path}#${prefix || ''}${key}()`;
    } else if (is.object(obj[key])) {
      ret[key] = wrapObject(obj[key], path, `${prefix || ''}${key}.`);
    }
  }
  return ret;

  function functionToMiddleware(func) {
    const objectIpcMiddleware = async function(...args) {
      return await utils.callFn(func, args, this);
    };
    for (const key in func) {
      objectIpcMiddleware[key] = func[key];
    }
    return objectIpcMiddleware;
  }
}
