'use strict';

const assert = require('assert');
const IoClient = require('socket.io-client');
const constant = require('../constant');
const EggConsoleLogger = require('egg-logger').EggConsoleLogger;
const Storage = require('../../lib/storage');

class SocketClient {
  constructor (port) {
    this.consoleLogger = new EggConsoleLogger();
    port = port ? parseInt(port) : this.getSocketcPort();

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

  call (method = '', ...params) {
    return new Promise((resolve, reject) => {
      // 获取通信频道
      const channel = constant.socketIo.channel.partySoftware;
      this.client.emit(channel, { cmd: method, params: params }, (response) => {
        resolve(response);
      });
    });
  }

  getCoreDB () {
    const coreDB = Storage.connection('system');
    return coreDB;
  }

  getSocketcPort () {
    const cdb = this.getCoreDB();
    const port = cdb.getItem('config').socketServer.port;
    return parseInt(port);
  }
}

module.exports = SocketClient;