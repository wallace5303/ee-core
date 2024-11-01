import fs from "fs";
import mkdirp from "mkdirp";
import convert from "koa-convert";
import * as is from "is-type-of";
import co from "./co.js";
import path from "path";
import chalk from "chalk";
import Pargv from "./pargv.js";
const _basePath = process.cwd();
export const fnDebounce = function () {
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
        if (!delayTime || isImediate)
            return fn(args);
        if (fnObject[fn]) {
            clearTimeout(timer);
            setTimer(fn, delayTime, args);
        }
        else {
            setTimer(fn, delayTime, args);
        }
    };
};
export const getRandomString = function () {
    return Math.random().toString(36).substring(2);
};
export const mkdir = function (filepath, opt = {}) {
    mkdirp.sync(filepath, opt);
    return;
};
export const chmodPath = function (path, mode) {
    let files = [];
    if (fs.existsSync(path)) {
        files = fs.readdirSync(path);
        files.forEach((file, index) => {
            const curPath = path + '/' + file;
            if (fs.statSync(curPath).isDirectory()) {
                this.chmodPath(curPath, mode); // 递归删除文件夹
            }
            else {
                fs.chmodSync(curPath, mode);
            }
        });
        fs.chmodSync(path, mode);
    }
};
export const compareVersion = function (v1, v2) {
    v1 = v1.split('.');
    v2 = v2.split('.');
    const len = Math.max(v1.length, v2.length);
    while (v1.length < len) {
        v1.push('0');
    }
    while (v2.length < len) {
        v2.push('0');
    }
    for (let i = 0; i < len; i++) {
        const num1 = parseInt(v1[i]);
        const num2 = parseInt(v2[i]);
        if (num1 > num2) {
            return 1;
        }
        else if (num1 < num2) {
            return -1;
        }
    }
    return 0;
};
export const callFn = async function (fn, args, ctx) {
    args = args || [];
    if (!is.function(fn))
        return;
    if (is.generatorFunction(fn))
        fn = co.wrap(fn);
    return ctx ? fn.call(ctx, ...args) : fn(...args);
};
export const middleware = function (fn) {
    return is.generatorFunction(fn) ? convert(fn) : fn;
};
export const stringify = function (obj, ignore = []) {
    const result = {};
    Object.keys(obj).forEach(key => {
        if (!ignore.includes(key)) {
            result[key] = obj[key];
        }
    });
    return JSON.stringify(result);
};
export const validValue = function (value) {
    return (value !== undefined &&
        value !== null &&
        value !== '');
};
export const checkConfig = function (prop) {
    const filepath = path.join(_basePath, prop);
    if (fs.existsSync(filepath)) {
        return true;
    }
    return false;
};
export const loadConfig = function (prop) {
    const configFile = prop;
    const filepath = path.join(_basePath, configFile);
    if (!fs.existsSync(filepath)) {
        const errorTips = 'config file ' + chalk.blue(`${filepath}`) + ' does not exist !';
        throw new Error(errorTips);
    }
    if (!obj)
        return obj;
    let ret = obj;
    if (is.function(obj) && !is.class(obj)) {
        ret = obj();
    }
    return ret || {};
};
export const sleep = function (ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
};
export const replaceArgsValue = function (argv, key, value) {
    key = key + "=";
    for (let i = 0; i < argv.length; i++) {
        let item = argv[i];
        let pos = item.indexOf(key);
        if (pos !== -1) {
            pos = pos + key.length;
            let tmpStr = item.substring(0, pos);
            argv[i] = tmpStr + value;
            break;
        }
    }
    return argv;
};
export const getValueFromArgv = function (argv, key) {
    const argvObj = Pargv(argv);
    if (argvObj.hasOwnProperty(key)) {
        return argvObj[key];
    }
    // match search
    key = key + "=";
    let value;
    for (let i = 0; i < argv.length; i++) {
        let item = argv[i];
        let pos = item.indexOf(key);
        if (pos !== -1) {
            pos = pos + key.length;
            value = item.substring(pos);
            break;
        }
    }
    return value;
};
export const fileIsExist = function (filepath) {
    if (fs.existsSync(filepath) && fs.statSync(filepath).isFile()) {
        return true;
    }
    return false;
};