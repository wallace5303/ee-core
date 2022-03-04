'use strict';

const socketServer = require('./socketServer');
const ipcServer = require('./ipcServer');

/**
 * server
 */
 module.exports = (app) => {

  // 启动 socket server
  new socketServer(app);

  // 启动 electron ipc server
  new ipcServer(app);

}

