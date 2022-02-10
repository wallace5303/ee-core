'use strict';

const IoServer = require('socket.io');
const IoClient = require('socket.io-client');
const socketServer = require('./socketServer');
const socketClient = require('./socketClient');

// const getSocketServer = () => {
//   return socketServer.getInstance();
// };

// const getSocketClient = () => {
//   return socketClient.getInstance();
// };

// const EeSocket = {
//   getServer: getSocketServer(),
//   getClient: getSocketClient()
// }
const EeSocket = {
  getServer: () => {
    return socketServer.getInstance();
  },
  getClient: () => {
    return socketClient.getInstance();
  }
}


module.exports = {
  IoServer,
  IoClient,
  EeSocket
};