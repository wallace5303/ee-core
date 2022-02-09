'use strict';

const { Server } = require('socket.io');
const getPort = require('get-port');
const constant = require('../constant');

/**
 * server
 */
exports.create = async () => {

  // console.log('app      ssss:', app.appInfo);
  // use api server
  const coredb = getCoreDB();
  let port = await getPort();
  port = port ? port : 7069;
  coredb.setItem('ipc_port', port);

  // 存到进程中
  process.env.EE_IPC_PORT = port;
  console.log('[ee-core:socket] [initSocket] dynamic ipc port:', port);

  const io = new Server(port);
  io.on('connection', (socket) => {
    let channel = constant.socketIo.channel.eggIoEe;

    socket.on(channel, (message, callback) => {
      console.log('[ee-core:socket] socket id:' + socket.id + ' message cmd: ' + message.cmd);
    });
  });

  return true;
}

/**
 * @class getCoreDB
 */
function getCoreDB () {
  const db = require('../storage/index').JsonDB.connection('system');
  return db;
}
