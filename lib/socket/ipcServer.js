'use strict';

const assert = require('assert');
const debug = require('debug')('ee-core:ipcServer');
const EggConsoleLogger = require('egg-logger').EggConsoleLogger;
const is = require('is-type-of');
const { ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const globby = require('globby');
const utils = require('../../core/lib/utils');
const utility = require('utility');

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
    const files = (process.env.EE_TYPESCRIPT === 'true' && utils.extensions['.ts'])
    ? [ '**/*.(js|ts)', '!**/*.d.ts' ]
    : [ '**/*.js' ];
    const directory = path.join(this.app.config.baseDir, 'controller');
    const filepaths = globby.sync(files, { cwd: directory });
    console.log('ipc---------------filepaths:', filepaths);
    for (const filepath of filepaths) {
      const fullpath = path.join(directory, filepath);
      if (!fs.statSync(fullpath).isFile()) continue;

      const properties = this.getProperties(filepath, {caseStyle: 'lower'});
      const pathName = directory.split(/[/\\]/).slice(-1) + '.' + properties.join('.');
      debug('pathName %s', pathName);

      console.log('ipc---------------pathName:', pathName);
    
      let fileObj = utils.loadFile(fullpath);
      const fns = {};
      if (is.function(fileObj) && !is.generatorFunction(fileObj) && !is.class(fileObj) && !is.asyncFunction(fileObj)) {
        //obj = obj(this.app);
      }
      if (is.class(fileObj)) {
        let proto = fileObj.prototype;
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
      if (is.object(fileObj)) {
        const keys = Object.keys(fileObj);
        for (const key of keys) {
          if (is.function(fileObj[key])) {
            const names = utility.getParamNames(fileObj[key]);
            if (names[0] === 'next') {
              throw new Error(`controller \`${prefix || ''}${key}\` should not use next as argument from file ${path}`);
            }
            fns[key] = 1;
          }
          // else if (is.object(fileObj[key])) {
          //   ret[key] = wrapObject(obj[key], path, `${prefix || ''}${key}.`);
          // }
        }
      }
      // if (is.generatorFunction(obj) || is.asyncFunction(obj)) {      
      // }

      console.log('ipc---------------fns:', fns);

      for (const key in fns) {
        let channel = pathName + '.' + key;
        console.log('ipc---------------channel:', channel);
        ipcMain.on(channel, async (event, params) => {
          try {
            // 挂载 event和channel
            self.app.socket.ipc = {
              event:event,
              channel: channel
            }

            // 找函数
            const cmd = channel;
            const args = params;
            let fn = null;
            if (is.string(cmd)) {
              const actions = cmd.split('.');
              let obj = self.app;
              actions.forEach(key => {
                obj = obj[key];
                if (!obj) throw new Error(`class or function '${key}' not exists`);
              });
              fn = obj;
            }
            if (!fn) throw new Error('function not exists');
    
            const result = await fn.call(self.app, ...args);
            event.reply(`${channel}`, result)
          } catch (err) {
            self.app.logger.error('[ee:socket:ipcMain] throw error:', err);
          }
        })
      }
      

    }
  }

  // convert file path to an array of properties
  // a/b/c.js => ['a', 'b', 'c']
  getProperties (filepath, { caseStyle }) {
    // if caseStyle is function, return the result of function
    if (is.function(caseStyle)) {
      const result = caseStyle(filepath);
      assert(is.array(result), `caseStyle expect an array, but got ${result}`);
      return result;
    }
    // use default camelize
    return this.defaultCamelize(filepath, caseStyle);
  }

  defaultCamelize (filepath, caseStyle) {
    const properties = filepath.substring(0, filepath.lastIndexOf('.')).split('/');
    return properties.map(property => {
      if (!/^[a-z][a-z0-9_-]*$/i.test(property)) {
        throw new Error(`${property} is not match 'a-z0-9_-' in ${filepath}`);
      }
  
      property = property.replace(/[_-][a-z]/ig, s => s.substring(1).toUpperCase());
      let first = property[0];
      switch (caseStyle) {
        case 'lower':
          first = first.toLowerCase();
          break;
        case 'upper':
          first = first.toUpperCase();
          break;
        case 'camel':
        default:
      }
      return first + property.substring(1);
    });
  }

  /**
   * 发送响应信息给渲染进程
   * @param event
   * @param channel
   * @param data
   * @private
   */
  _echo (event, channel, data) {
    console.log('[ipc] [answerRenderer] result: ', {channel, data})
    event.reply(`${channel}`, data)
  }

  /**
   * 执行主进程函数,并响应渲染进程
   * @param channel
   * @param callback
   */
  answerRenderer (channel, callback) {
    ipc.on(channel, async (event, param) => {
      const result = await callback(event, channel, param)
      _echo(event, channel, result)
    })
  }
}

module.exports = IpcServer;