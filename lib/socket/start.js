'use strict';

const getPort = require('get-port');
const EggConsoleLogger = require('egg-logger').EggConsoleLogger;
const socketServer = require('./socketServer');

/**
 * server
 */
exports.create = async (app) => {
  const consoleLogger = new EggConsoleLogger();
  const coredb = getCoreDB();
  let port = await getPort();
  port = port ? port : 7069;
  coredb.setItem('ipc_port', port);

  consoleLogger.info('[ee-core:socket:start] dynamic ipc port:', port);

  // 启动 server
  new socketServer(port, app);

}

/**
 * getCoreDB
 */
function getCoreDB () {
  const db = require('../storage/index').JsonDB.connection('system');
  return db;
}
