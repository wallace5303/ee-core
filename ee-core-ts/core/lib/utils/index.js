'use strict';

require('bytenode');
const convert = require('koa-convert');
const is = require('is-type-of');
const path = require('path');
const fs = require('fs');
const co = require('../../../utils/co');
const BuiltinModule = require('module');

// Guard against poorly mocked module constructors.
const Module = module.constructor.length > 1
  ? module.constructor
  /* istanbul ignore next */
  : BuiltinModule;

// Module._extensions:
// '.js': [Function (anonymous)],
// '.json': [Function (anonymous)],
// '.node': [Function: func],
// '.jsc': [Function (anonymous)]

module.exports = {
  extensions: Module._extensions,

  loadFile(filepath) {
    try {
      // if not js module, just return content buffer
      const extname = path.extname(filepath);
      if (extname && !Module._extensions[extname]) {
        return fs.readFileSync(filepath);
      }

      // require js module
      const obj = require(filepath);
      if (!obj) return obj;
      // it's es module
      if (obj.__esModule) return 'default' in obj ? obj.default : obj;
      return obj;
    } catch (err) {
      err.message = `[ee-core] load file: ${filepath}, error: ${err.message}`;
      throw err;
    }
  },

  methods: [ 'head', 'options', 'get', 'put', 'patch', 'post', 'delete' ],

  async callFn(fn, args, ctx) {
    args = args || [];
    if (!is.function(fn)) return;
    if (is.generatorFunction(fn)) fn = co.wrap(fn);
    return ctx ? fn.call(ctx, ...args) : fn(...args);
  },

  middleware(fn) {
    return is.generatorFunction(fn) ? convert(fn) : fn;
  },

  getCalleeFromStack(withLine, stackIndex) {
    stackIndex = stackIndex === undefined ? 2 : stackIndex;
    const limit = Error.stackTraceLimit;
    const prep = Error.prepareStackTrace;

    Error.prepareStackTrace = prepareObjectStackTrace;
    Error.stackTraceLimit = 5;

    // capture the stack
    const obj = {};
    Error.captureStackTrace(obj);
    let callSite = obj.stack[stackIndex];
    let fileName;
    /* istanbul ignore else */
    if (callSite) {
      fileName = callSite.getFileName();
      /* istanbul ignore if */
      if (fileName && fileName.endsWith('egg-mock/lib/app.js')) {
        // TODO: add test
        callSite = obj.stack[stackIndex + 1];
        fileName = callSite.getFileName();
      }
    }

    Error.prepareStackTrace = prep;
    Error.stackTraceLimit = limit;

    /* istanbul ignore if */
    if (!callSite || !fileName) return '<anonymous>';
    if (!withLine) return fileName;
    return `${fileName}:${callSite.getLineNumber()}:${callSite.getColumnNumber()}`;
  },

  getResolvedFilename(filepath, baseDir) {
    const reg = /[/\\]/g;
    return filepath.replace(baseDir + path.sep, '').replace(reg, '/');
  },

  /**
   * 字节码类
   */
  isBytecodeClass (exports) {
    let isClass = false;

    // 标识
    if (exports.toString().indexOf('[class') != -1) {
      isClass = true;
    }
    // TODO 更严谨的判断，应该加上文件名和路径
    
    return isClass;
  },

  /**
   * 文件类型
   */
  filePatterns () {
    const files = (process.env.EE_TYPESCRIPT === 'true' && Module._extensions['.ts'])
    ? [ '**/*.(js|ts)', '!**/*.d.ts' ]
    : [ '**/*.js','**/*.jsc' ];

    return files;
  }

};


/**
 * Capture call site stack from v8.
 * https://github.com/v8/v8/wiki/Stack-Trace-API
 */

function prepareObjectStackTrace(obj, stack) {
  return stack;
}
