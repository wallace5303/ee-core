'use strict';

const assert = require('assert');
const { Server } = require('socket.io');
const constant = require('../constant');
const EggConsoleLogger = require('egg-logger').EggConsoleLogger;
const utils = require('../../utils/index');
const is = require('is-type-of');

/**
 * 类文件，顶部new egglogger 后，出现代码无法正常加载
 */
class SocketServer {
  constructor (port, app) {
    assert(typeof port === 'number', 'port required, and must be a number');

    this.consoleLogger = new EggConsoleLogger();
    this.consoleLogger.info('[ee-core:socket:server] start server, socket port is:', port);
    this.io = new Server(port);
    this.connec();
    this.app = app;
  }

  connec () {
    this.consoleLogger.info('[ee-core:socket:server] connection .....');
    this.io.on('connection', (socket) => {
      const channel = constant.socketIo.channel.eggIoEe;
      socket.on(channel, (message, callback) => {
        this.consoleLogger.info('[ee-core:socket:server] socket id:' + socket.id + ' message cmd: ' + message.cmd);

        // 找函数
        const cmd = message.cmd;
        const args = message.params;
        let fn = null;
        if (is.string(cmd)) {
          const actions = cmd.split('.');
          console.log('aaaaaaaaaaaaaaaaa actions:', actions);
          let obj = this.app;
          actions.forEach(key => {
            console.log('aaaaaaaaaaaaaaaaa key:', key);
            obj = obj[key];
            if (!obj) throw new Error(`key '${key}' not exists`);
          });
          fn = obj;
        }

        if (!fn) throw new Error('fn not exists');

        const result = utils.callFn(fn, [args]);
        console.log('aaaaaaaaaaaaaaaaa result:', result);
        callback('succe')
      });
    });
  }

  getCoreDB () {
    const coreDB = require('../storage/index').JsonDB.connection('system');
    return coreDB;
  }

  getIpcPort () {
    const cdb = this.getCoreDB();
    const port = cdb.getItem('ipc_port');
    return port;
  }
}

module.exports = SocketServer;