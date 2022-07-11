'use strict';

const assert = require('assert');
const { Server } = require('socket.io');
const constant = require('../constant');
const EggConsoleLogger = require('egg-logger').EggConsoleLogger;
const is = require('is-type-of');

/**
 * socket server
 */
class SocketServer {
  constructor (app) {
    this.app = app;
    const options = this.app.config.socketServer;
    this.consoleLogger = new EggConsoleLogger();

    if (!options.enable) {
      return;
    }

    let port = process.env.EE_SOCKET_PORT ? parseInt(process.env.EE_SOCKET_PORT) : parseInt(this.getSocketPort());
    assert(typeof port === 'number', 'socekt port required, and must be a number');
    this.consoleLogger.info('[ee-core:socket:server] socket server port is:', port);

    // let opt = Object.assign({}, options);
    // delete opt.enable;
    this.io = new Server(port, options);
    this.connec();
  }

  connec () {
    const self = this;
    this.consoleLogger.info('[ee-core:socket:server] connection .....');
    this.io.on('connection', (socket) => {
      const channel = constant.socketIo.channel.partySoftware;
      socket.on(channel, async (message, callback) => {
        self.consoleLogger.info('[ee-core:socket:server] socket id:' + socket.id + ' message cmd: ' + message.cmd);

        try {
          // 找函数
          const cmd = message.cmd;
          const args = message.params;
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

          const result = await fn.call(self.app, args);
          callback(result);
        } catch (err) {
          self.app.console.error('[ee-core:socket:server] throw error:', err);
        }
      });
    });
  }

  getCoreDB () {
    const coreDB = require('../storage/index').JsonDB.connection('system');
    return coreDB;
  }

  getSocketPort () {
    const cdb = this.getCoreDB();
    const port = cdb.getItem('config').socketServer.port;
    return port;
  }
}

module.exports = SocketServer;