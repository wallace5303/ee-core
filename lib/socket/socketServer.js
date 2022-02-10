'use strict';

const assert = require('assert');
const { Server } = require('socket.io');
const constant = require('../constant');
const EggConsoleLogger = require('egg-logger').EggConsoleLogger;

/**
 * 类文件，顶部new egglogger 后，出现代码无法正常加载
 */
class SocketServer {
  constructor (port) {
    // egg应用引用时，处于不同进程，则从db里面找端口
    if (!port) {
      consoleLogger.info('[ee-core:socket:server] cache_port:', this.getIpcPort());
    }
    port = port ? port : this.getIpcPort();

    assert(typeof port === 'number', 'port required, and must be a number');
    this.consoleLogger = new EggConsoleLogger();
    this.consoleLogger.info('[ee-core:socket:server] start server, socket port is:', port);
    this.io = new Server(port);
    this.connec();
  }

  static getInstance (port) {
    if (typeof this.instance === 'object') {
      return this.instance;
    }
    this.instance = new SocketServer(port);
    return this.instance;
  }

  connec () {
    this.consoleLogger.info('[ee-core:socket:server] connection .....');
    this.io.on('connection', (socket) => {
      const channel = constant.socketIo.channel.eggIoEe;
      socket.on(channel, (message, callback) => {
        this.consoleLogger.info('[ee-core:socket:server] socket id:' + socket.id + ' message cmd: ' + message.cmd);
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