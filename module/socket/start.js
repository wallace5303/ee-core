'use strict';

const socketServer = require('./socketServer');
const ipcServer = require('./ipcServer');
const httpServer = require('./httpServer');

/**
 * server
 */
 module.exports = (app) => {

  // 启动 socket server
  new socketServer(app);

  // 启动 http server
  new httpServer(app);  

  // 启动 electron ipc server
  new ipcServer(app);

}

