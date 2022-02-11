'use strict';

const socketServer = require('./socketServer');

/**
 * server
 */
exports.create = (app) => {

  // 启动 server
  new socketServer(app);

}

