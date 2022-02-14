'use strict';

const socketServer = require('./socketServer');
const ipcServer = require('./ipcServer');

/**
 * server
 */
exports.create = (app) => {

  // 启动 socket server
  new socketServer(app);

  // 启动 ipc server
  new ipcServer(app);

}

