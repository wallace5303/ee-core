import * as debug$0 from "debug";
import * as is from "is-type-of";
import electron from "electron";
import path from "path";
import fs from "fs";
import globby from "globby";
import Utils from "../core/lib/utils/index.js";
import * as Wrap from "../utils/wrap.js";
import Log from "../log/index.js";
const debug = debug$0('ee-core:ipcServer');
const { ipcMain } = electron;
class IpcServer {
    constructor(app) {
        this.app = app;
        this.register();
    }
    register() {
        const self = this;
        // 遍历方法
        const files = Utils.filePatterns();
        const directory = path.join(this.app.config.baseDir, 'controller');
        const filepaths = globby.sync(files, { cwd: directory });
        for (const filepath of filepaths) {
            const fullpath = path.join(directory, filepath);
            if (!fs.statSync(fullpath).isFile())
                continue;
            const properties = Wrap.getProperties(filepath, { caseStyle: 'lower' });
            const pathName = directory.split(/[/\\]/).slice(-1) + '.' + properties.join('.');
            let fileObj = Utils.loadFile(fullpath);
            const fns = {};
            // 为了统一，仅支持class文件
            if (is.class(fileObj) || Utils.isBytecodeClass(fileObj)) {
                let proto = fileObj.prototype;
                // 不遍历父类的方法
                //while (proto !== Object.prototype) {
                const keys = Object.getOwnPropertyNames(proto);
                for (const key of keys) {
                    if (key === 'constructor') {
                        continue;
                    }
                    const d = Object.getOwnPropertyDescriptor(proto, key);
                    if (is.function(d.value) && !fns.hasOwnProperty(key)) {
                        fns[key] = 1;
                    }
                }
                //proto = Object.getPrototypeOf(proto);
                //}
            }
            debug('register class %s fns %j', pathName, fns);
            for (const key in fns) {
                let channel = pathName + '.' + key;
                debug('register channel %s', channel);
                function findFn(app, c) {
                    try {
                        // 找函数
                        const cmd = c;
                        let fn = null;
                        if (is.string(cmd)) {
                            const actions = cmd.split('.');
                            let obj = app;
                            actions.forEach(key => {
                                obj = obj[key];
                                if (!obj)
                                    throw new Error(`class or function '${key}' not exists`);
                            });
                            fn = obj;
                        }
                        if (!fn)
                            throw new Error('function not exists');
                        return fn;
                    }
                    catch (err) {
                        Log.coreLogger.error('[ee-core] [socket/IpcServer] throw error:', err);
                    }
                    return null;
                }
                // send/on 模型
                ipcMain.on(channel, async (event, params) => {
                    try {
                        const fn = findFn(self.app, channel);
                        const result = await fn.call(self.app, params, event);
                        event.returnValue = result;
                        event.reply(`${channel}`, result);
                    }
                    catch (e) {
                        Log.coreLogger.error('[ee-core] [socket/IpcServer] send/on throw error:', e);
                        // event.returnValue = e;
                        // event.reply(`${channel}`, e);
                    }
                });
                // invoke/handle 模型
                ipcMain.handle(channel, async (event, params) => {
                    try {
                        const fn = findFn(self.app, channel);
                        const result = await fn.call(self.app, params, event);
                        return result;
                    }
                    catch (e) {
                        Log.coreLogger.error('[ee-core] [socket/IpcServer] invoke/handle throw error:', e);
                        return e;
                    }
                });
            }
        }
    }
}
export default IpcServer;
