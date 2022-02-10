'use strict';

const assert = require('assert');
const IoClient = require('socket.io-client');
const constant = require('../constant');
const EggConsoleLogger = require('egg-logger').EggConsoleLogger;
const consoleLogger = new EggConsoleLogger();

class SocketClient {
  constructor (port) {
    if (!port) {
      consoleLogger.info('[ee-core:socket:client] cache_port:', this.getIpcPort());
    }
    port = port ? port : this.getIpcPort();

    assert(typeof port === 'number', 'port required, and must be a number');
    consoleLogger.info('[ee-core:socket:client] start');
    
    const url  = 'http://localhost:' + port;
    consoleLogger.info('[ee-core:socket:client] url:', url);
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
    const self = this;
    console.log('testElectronApi: 2222');
    
    return new Promise((resolve, reject) => {
      // 获取通信频道
      const channel = constant.socketIo.channel.eggIoEe;
      self.client.emit(channel, { cmd: method, params: params }, (response) => {
        console.log('testElectronApi: 3333');
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