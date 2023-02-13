const debug = require('debug')('ee-core:ipcServer');
const EggConsoleLogger = require('egg-logger').EggConsoleLogger;
const is = require('is-type-of');
const { ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const globby = require('globby');
const utils = require('../../core/lib/utils');
const wrap = require('../../module/utils/wrap');

class IpcServer {
  constructor (app) {

    this.app = app;
    this.consoleLogger = new EggConsoleLogger();
    this.consoleLogger.info('[ee-core:socket:ipcMain] start ipcMain');
    this.register();
  }

  register () {
    this.consoleLogger.info('[ee-core:socket:ipcMain] register channels');

    const self = this;
    // 遍历方法
    const files = utils.filePatterns();
    const directory = path.join(this.app.config.baseDir, 'controller');
    const filepaths = globby.sync(files, { cwd: directory });

    for (const filepath of filepaths) {
      const fullpath = path.join(directory, filepath);
      if (!fs.statSync(fullpath).isFile()) continue;

      const properties = wrap.getProperties(filepath, {caseStyle: 'lower'});
      const pathName = directory.split(/[/\\]/).slice(-1) + '.' + properties.join('.');

      let fileObj = utils.loadFile(fullpath);
      const fns = {};
      // 为了统一，仅支持class文件
      if (is.class(fileObj) || utils.isBytecodeClass(fileObj)) {
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

        function findFn (app, c) {
          try {
            // 找函数
            const cmd = c;
            let fn = null;
            if (is.string(cmd)) {
              const actions = cmd.split('.');
              let obj = app;
              actions.forEach(key => {
                obj = obj[key];
                if (!obj) throw new Error(`class or function '${key}' not exists`);
              });
              fn = obj;
            }
            if (!fn) throw new Error('function not exists');
            
            return fn;
          } catch (err) {
            app.logger.error('[ee:socket:ipcMain] throw error:', err);
          }
          return null;
        }

        // send/on 模型
        ipcMain.on(channel, async (event, params) => {
          const fn = findFn(self.app, channel);
          const result = await fn.call(self.app, params, event);

          event.returnValue = result;
          event.reply(`${channel}`, result);
        });

        // invoke/handle 模型
        ipcMain.handle(channel, async (event, params) => {
          const fn = findFn(self.app, channel);
          const result = await fn.call(self.app, params, event);

          return result;
        });
      }
    }
  }
}

module.exports = IpcServer;