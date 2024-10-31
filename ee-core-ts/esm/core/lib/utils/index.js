import "bytenode";
import convert from "koa-convert";
import * as is from "is-type-of";
import path from "path";
import fs from "fs";
import co from "../../../utils/co.js";
import BuiltinModule from "module";
'use strict';
// Guard against poorly mocked module constructors.
const Module = module.constructor.length > 1
    ? module.constructor
    /* istanbul ignore next */
    : BuiltinModule;
/**
 * Capture call site stack from v8.
 * https://github.com/v8/v8/wiki/Stack-Trace-API
 */
function prepareObjectStackTrace(obj, stack) {
    return stack;
}
export const extensions = Module._extensions;
export function loadFile(filepath) {
    try {
        // if not js module, just return content buffer
        const extname = path.extname(filepath);
        if (extname && !Module._extensions[extname]) {
            return fs.readFileSync(filepath);
        }
        // require js module
        const obj = require(filepath);
        if (!obj)
            return obj;
        // it's es module
        if (obj.__esModule)
            return 'default' in obj ? obj.default : obj;
        return obj;
    }
    catch (err) {
        err.message = `[ee-core] load file: ${filepath}, error: ${err.message}`;
        throw err;
    }
}
export const methods = ['head', 'options', 'get', 'put', 'patch', 'post', 'delete'];
export async function callFn(fn, args, ctx) {
    args = args || [];
    if (!is.function(fn))
        return;
    if (is.generatorFunction(fn))
        fn = co.wrap(fn);
    return ctx ? fn.call(ctx, ...args) : fn(...args);
}
export function middleware(fn) {
    return is.generatorFunction(fn) ? convert(fn) : fn;
}
export function getCalleeFromStack(withLine, stackIndex) {
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
    if (!callSite || !fileName)
        return '<anonymous>';
    if (!withLine)
        return fileName;
    return `${fileName}:${callSite.getLineNumber()}:${callSite.getColumnNumber()}`;
}
export function getResolvedFilename(filepath, baseDir) {
    const reg = /[/\\]/g;
    return filepath.replace(baseDir + path.sep, '').replace(reg, '/');
}
export function 
/**
 * 字节码类
 */
isBytecodeClass(exports) {
    let isClass = false;
    // 标识
    if (exports.toString().indexOf('[class') != -1) {
        isClass = true;
    }
    // TODO 更严谨的判断，应该加上文件名和路径
    return isClass;
}
export function 
/**
 * 文件类型
 */
filePatterns() {
    const files = (process.env.EE_TYPESCRIPT === 'true' && Module._extensions['.ts'])
        ? ['**/*.(js|ts)', '!**/*.d.ts']
        : ['**/*.js', '**/*.jsc'];
    return files;
}
export default {
    extensions,
    loadFile,
    methods,
    callFn,
    middleware,
    getCalleeFromStack,
    getResolvedFilename,
    isBytecodeClass,
    filePatterns
};
