'use strict';

/**
 * 该文件将废弃
 */

const IoServer = require('socket.io');
const IoClient = require('socket.io-client');
//const socketServer = require('./socketServer');
// const socketClient = require('./socketClient');
const Koa = require('koa');

const EeSocket = {
  getServer: () => {
    //return socketServer.getInstance();
  },
  getClient: () => {
    //return socketClient.getInstance();
  }
}


module.exports = {
  IoServer,
  IoClient,
  EeSocket,
  Koa
};