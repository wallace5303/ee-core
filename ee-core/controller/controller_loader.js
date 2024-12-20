'use strict';

const debug = require('debug')('ee-core:controller:controller_loader');
const path = require('path');
const is = require('is-type-of');
const Ps = require('../ps');
const Timing = require('../core/utils/timing');
const { FileLoader, FULLPATH} = require('../core/loader/file_loader');
const CoreUtils = require('../core/utils');


class ControllerLoader {
  constructor() {
    this.timing = new Timing();
  }

  /**
   * Load controller/xxx.js
   */
  load() {
    this.timing.start('Load Controller');

    const opt = {
      caseStyle: 'lower',
      directory: path.join(Ps.getElectronDir(), 'controller'),
      inject: {},
      initializer: (obj, opt) => {
        if (is.class(obj) || CoreUtils.isBytecodeClass(obj)) {
          obj.prototype.pathName = opt.pathName;
          obj.prototype.fullPath = opt.path;
          return wrapClass(obj);
        }
        return obj;
      },
    };
    const target = new FileLoader(opt).load();
    
    this.timing.end('Load Controller');
    return target;
  }
}

// wrap the class, yield a object with middlewares
function wrapClass(Controller) {
  let proto = Controller.prototype;
  const ret = {};
  // tracing the prototype chain
  while (proto !== Object.prototype) {
    const keys = Object.getOwnPropertyNames(proto);
    debug("[wrapClass] keys:", keys);
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
        ret[key] = methodToMiddleware(Controller, key);
        ret[key][FULLPATH] = Controller.prototype.fullPath + '#' + Controller.name + '.' + key + '()';
      }
    }
    proto = Object.getPrototypeOf(proto);
  }

  return ret;

  function methodToMiddleware(Controller, key) {
    return function classControllerMiddleware(...args) {
      const controller = new Controller();
      return CoreUtils.callFn(controller[key], args, controller);
    };
  }
}

module.exports = {
  ControllerLoader
};