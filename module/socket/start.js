'use strict';

const SocketServer = require('./socketServer');
const IpcServer = require('./ipcServer');
const HttpServer = require('./httpServer');

/**
 * server
 */
module.exports = (app) => {

  // 启动 socket server
  new SocketServer(app);

  // 启动 http server
  new HttpServer(app);  

  // 启动 electron ipc server
  new IpcServer(app);

}

