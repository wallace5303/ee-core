'use strict';

//const { Server } = require('socket.io');
const socketIo = require('socket.io');
const getPort = require('get-port');
const constant = require('../constant');
const http = require('http');

/**
 * server
 */
exports.create = async (db) => {

  console.log('app      ssss:', db);
  // use api server
  const coredb = getCoreDB();
  let port = await getPort();
  port = port ? port : 7069;
  coredb.setItem('ipc_port', port);

  console.log('[ee-core:socket] [initSocket] dynamic ipc port:', port);

  const server = http.createServer(function(req, res) {
  });

  //const io = new Server(port);
  const io = socketIo(server);
  io.on('connection', (socket) => {
    const channel = constant.socketIo.channel.eggIoEe;
    socket.on(channel, (message, callback) => {
      console.log('[ee-core:socket] socket id:' + socket.id + ' message cmd: ' + message.cmd);
    });
  });

  const listen = 'localhost';
  server.listen(port, listen, function() {
    console.log('[ee-core:socket] server is listening on', `${listen}:${port}`);
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
