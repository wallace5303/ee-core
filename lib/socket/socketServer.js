'use strict';

const assert = require('assert');
const { Server } = require('socket.io');
const constant = require('../constant');
const EggConsoleLogger = require('egg-logger').EggConsoleLogger;
const is = require('is-type-of');

/**
 * 类文件，顶部new egglogger 后，出现代码无法正常加载
 */
class SocketServer {
  constructor (app) {
    let port = process.env.EE_IPC_PORT ? parseInt(process.env.EE_IPC_PORT) : parseInt(this.getIpcPort());

    assert(typeof port === 'number', 'port required, and must be a number');

    this.app = app;
    this.consoleLogger = new EggConsoleLogger();
    this.consoleLogger.info('[ee-core:socket:server] start server, socket port is:', port);
    this.io = new Server(port);
    this.connec();
  }

  connec () {
    this.consoleLogger.info('[ee-core:socket:server] connection .....');
    this.io.on('connection', (socket) => {
      const channel = constant.socketIo.channel.eggIoEe;
      socket.on(channel, async (message, callback) => {
        this.consoleLogger.info('[ee-core:socket:server] socket id:' + socket.id + ' message cmd: ' + message.cmd);

        try {
          // 找函数
          const cmd = message.cmd;
          const args = message.params;
          let fn = null;
          if (is.string(cmd)) {
            const actions = cmd.split('.');
            let obj = this.app;
            actions.forEach(key => {
              obj = obj[key];
              if (!obj) throw new Error(`class or function '${key}' not exists`);
            });
            fn = obj;
          }
          if (!fn) throw new Error('function not exists');

          const result = await fn.call(this.app, ...args);
          callback(result);
        } catch (err) {
          this.app.logger.error('[ee:socket] throw error:', err);
        }
 
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