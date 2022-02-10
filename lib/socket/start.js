'use strict';

const getPort = require('get-port');
const EggConsoleLogger = require('egg-logger').EggConsoleLogger;
const consoleLogger = new EggConsoleLogger();
const socketServer = require('./socketServer');
const socketClient = require('./socketClient');

/**
 * server
 */
exports.create = async () => {
  const coredb = getCoreDB();
  let port = await getPort();
  port = port ? port : 7069;
  coredb.setItem('ipc_port', port);

  consoleLogger.info('[ee-core:socket:start] dynamic ipc port:', port);

  // 启动 server
  socketServer.getInstance(port);

  // 启动 client
  //socketClient.getInstance(port);
}

/**
 * getCoreDB
 */
function getCoreDB () {
  const db = require('../storage/index').JsonDB.connection('system');
  return db;
}
