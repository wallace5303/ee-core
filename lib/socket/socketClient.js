'use strict';

const assert = require('assert');
const IoClient = require('socket.io-client');
const constant = require('../constant');
const EggConsoleLogger = require('egg-logger').EggConsoleLogger;

class SocketClient {
  constructor (port) {
    this.consoleLogger = new EggConsoleLogger();
    port = port ? port : this.getIpcPort();

    assert(typeof port === 'number', 'port required, and must be a number');
    this.consoleLogger.info('[ee-core:socket:client] start client');
    
    const url  = 'http://127.0.0.1:' + port;
    this.consoleLogger.info('[ee-core:socket:client] url:', url);
    this.client = IoClient(url);
  }

  static getInstance (port) {
    if (typeof this.instance === 'object') {
      return this.instance;
    }
    this.instance = new SocketClient(port);
    return this.instance;
  }

  send (method = '', params) {
    return new Promise((resolve, reject) => {
      // 获取通信频道
      const channel = constant.socketIo.channel.eggIoEe;
      this.client.emit(channel, { cmd: method, params: params }, (response) => {
        resolve(response);
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

module.exports = SocketClient;