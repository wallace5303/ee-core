import * as is from "is-type-of";
import fs from "fs";
import path from "path";
import UtilsCore from "../core/lib/utils/index.js";
import * as Ps from "../ps/index.js";
import Log from "../log/index.js";
export const loadOneFile = moduleExports.loadOneFile;
export function 
/**
 * 加载js文件
 *
 * @param {String} filepath - fullpath
 * @return {Any} exports
 * @since 1.0.0
 */
loadJsFile(filepath) {
    if (!fs.existsSync(filepath)) {
        let errMsg = `[ee-core] [loader] loadJobFile ${filepath} does not exist`;
        Log.coreLogger.error(errMsg);
        return;
    }
    const ret = UtilsCore.loadFile(filepath);
    return ret;
}
export function 
/**
 * 加载并运行js文件
 *
 * @param {String} filepath - fullpath
 * @param {Array} inject - pass rest arguments into the function when invoke
 * @return {Any}
 * @since 1.0.0
 */
execJsFile(filepath, ...inject) {
    if (!fs.existsSync(filepath)) {
        let errMsg = `[ee-core] [loader] loadJobFile ${filepath} does not exist`;
        Log.coreLogger.error(errMsg);
        return;
    }
    let ret = UtilsCore.loadFile(filepath);
    if (is.class(ret) || UtilsCore.isBytecodeClass(ret)) {
        ret = new ret(inject);
    }
    else if (is.function(ret)) {
        ret = ret(inject);
    }
    return ret;
}
export function 
/**
 * 模块的绝对路径
 * @param {String} filepath - fullpath
 */
resolveModule(filepath) {
    let fullpath;
    try {
        fullpath = require.resolve(filepath);
    }
    catch (e) {
        // 特殊后缀处理
        if (filepath && (filepath.endsWith('.defalut') || filepath.endsWith('.prod'))) {
            fullpath = filepath + '.jsc';
        }
        else if (filepath && filepath.endsWith('.js')) {
            fullpath = filepath + 'c';
        }
        if (!fs.existsSync(filepath) && !fs.existsSync(fullpath)) {
            let files = { filepath, fullpath };
            Log.coreLogger.warn(`[ee-core] [loader] resolveModule unknow filepath: ${files}`);
            return undefined;
        }
    }
    return fullpath;
}
export const requireModule = moduleExports.requireModule;
export const requireJobsModule = moduleExports.requireJobsModule;
export const getFullpath = moduleExports.getFullpath;
const moduleExports = {
    /**
     * 加载单个文件(如果是函数，将被执行)
     *
     * @param {String} filepath - fullpath
     * @param {Array} inject - pass rest arguments into the function when invoke
     * @return {Object} exports
     * @since 1.0.0
     */
    loadOneFile(filepath, ...inject) {
        const isAbsolute = path.isAbsolute(filepath);
        if (!isAbsolute) {
            filepath = path.join(Ps.getBaseDir(), filepath);
        }
        filepath = filepath && this.resolveModule(filepath);
        if (!fs.existsSync(filepath)) {
            let errorMsg = `[ee-core] [loader/index] loadOneFile ${filepath} does not exist`;
            Log.coreLogger.error(errorMsg);
            throw new Error(errorMsg);
        }
        const ret = UtilsCore.loadFile(filepath);
        if (is.function(ret) && !is.class(ret) && !UtilsCore.isBytecodeClass(ret)) {
            ret = ret(...inject);
        }
        return ret;
    },
    loadJsFile,
    execJsFile,
    resolveModule,
    /**
     * 加载模块(子进程中使用)
     *
     * @param {String} filepath - fullpath
     * @return {Object} exports
     * @since 1.0.0
     */
    requireModule(filepath, type = '') {
        let fullpath;
        const isAbsolute = path.isAbsolute(filepath);
        if (!isAbsolute) {
            filepath = path.join(Ps.getBaseDir(), type, filepath);
        }
        fullpath = this.resolveModule(filepath);
        if (!fs.existsSync(fullpath)) {
            let errorMsg = `[ee-core] [loader] requireModule filepath: ${filepath} does not exist`;
            Log.coreLogger.error(errorMsg);
        }
        const ret = UtilsCore.loadFile(fullpath);
        return ret;
    },
    /**
     * 加载jobs模块(子进程中使用)
     *
     * @param {String} filepath - fullpath
     * @return {Object} exports
     * @since 1.0.0
     */
    requireJobsModule(filepath) {
        const ret = this.requireModule(filepath, 'jobs');
        return ret;
    },
    /**
     * 获取electron目录下文件的绝对路径
     * @param {String} filepath - fullpath
     */
    getFullpath(filepath) {
        let fullpath;
        const isAbsolute = path.isAbsolute(filepath);
        if (!isAbsolute) {
            filepath = path.join(Ps.getBaseDir(), filepath);
        }
        fullpath = this.resolveModule(filepath);
        if (!fs.existsSync(fullpath)) {
            throw new Error(`[ee-core] [loader] getFullpath filepath ${fullpath} not exists`);
        }
        return fullpath;
    }
};
export default moduleExports;
