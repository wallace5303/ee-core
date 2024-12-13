'use strict';

require('bytenode');
const is = require('is-type-of');
const path = require('path');
const fs = require('fs');
const co = require('../../utils/co');
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

const extensions = Module._extensions;

function loadFile(filepath) {
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
}

async function callFn(fn, args, ctx) {
  args = args || [];
  if (!is.function(fn)) return;
  if (is.generatorFunction(fn)) fn = co.wrap(fn);
  return ctx ? fn.call(ctx, ...args) : fn(...args);
}

function getResolvedFilename(filepath, baseDir) {
  const reg = /[/\\]/g;
  return filepath.replace(baseDir + path.sep, '').replace(reg, '/');
}

/**
 * 字节码类
 */
function isBytecodeClass(exports) {
  let isClass = false;

  // 标识
  if (exports.toString().indexOf('[class') != -1) {
    isClass = true;
  }
  // TODO 更严谨的判断，应该加上文件名和路径
  
  return isClass;
}

/**
 * 文件类型
 */
function filePatterns() {
  const files = (process.env.EE_TYPESCRIPT === 'true' && Module._extensions['.ts'])
  ? [ '**/*.(js|ts)', '!**/*.d.ts' ]
  : [ '**/*.js','**/*.jsc' ];

  return files;
}

module.exports = {
  extensions,
  loadFile,
  callFn,
  getResolvedFilename,
  isBytecodeClass,
  filePatterns,
};
