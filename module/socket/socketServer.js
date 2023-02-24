'use strict';

const assert = require('assert');
const { Server } = require('socket.io');
const is = require('is-type-of');
const Storage = require('../storage');
const Constants = require('../const');
const Log = require('../log');

/**
 * socket server
 */
class SocketServer {
  constructor (app) {
    this.app = app;
    const options = this.app.config.socketServer;

    if (!options.enable) {
      return;
    }

    let port = process.env.EE_SOCKET_PORT ? parseInt(process.env.EE_SOCKET_PORT) : parseInt(this.getSocketPort());
    assert(typeof port === 'number', 'socekt port required, and must be a number');
    this.consoleLogger.info('[ee-core] [module/socket/socketServer] port is:', port);

    // let opt = Object.assign({}, options);
    // delete opt.enable;
    this.io = new Server(port, options);
    this.connec();
  }

  connec () {
    const self = this;
    this.io.on('connection', (socket) => {
      const channel = Constants.socketIo.channel.partySoftware;
      socket.on(channel, async (message, callback) => {
        console.log('[ee-core] [module/socket/socketServer] socket id:' + socket.id + ' message cmd: ' + message.cmd);

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
          Log.coreLogger.error('[ee-core] [module/socket/socketServer] throw error:', err);
        }
      });
    });
  }

  getCoreDB () {
    const coreDB = Storage.connection('system');
    return coreDB;
  }

  getSocketPort () {
    const cdb = this.getCoreDB();
    const port = cdb.getItem('config').socketServer.port;
    return port;
  }
}

module.exports = SocketServer;