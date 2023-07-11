'use strict';

const IoServer = require('socket.io');
const IoClient = require('socket.io-client');
const Koa = require('koa');
const EESocketServer = Symbol('Ee#SocketServer');
const EEIpcServer = Symbol('Ee#IpcServer');
const EEHttpServer = Symbol('Ee#HttpServer');

const EeSocket = {

  /**
   * 提供基础库 - 避免用户重复安装
   */
  Koa,
  IoServer,
  IoClient,

  /**
   * 启动所有服务
   */ 
  startAll(app) {
    this._createSocketServer(app);
    this._createHttpServer(app);
    this._createIpcServer(app);
  },

  /**
   * 创建SocketServer
   */ 
  _createSocketServer(app) {
    const SocketServer = require('./socketServer');
    this[EESocketServer] = new SocketServer(app);

    return this[EESocketServer];
  },

  /**
   * 获取 Socket Server
   */
  getSocketServer() {
    return this[EESocketServer] || null;
  },  

  /**
   * 创建 Http Server
   */ 
  _createHttpServer(app) {
    const HttpServer = require('./httpServer');
    this[EEHttpServer] = new HttpServer(app);

    return this[EEHttpServer];
  },

  /**
   * 获取 Http Server
   */
  getHttpServer() {
    return this[EEHttpServer] || null;
  }, 

  /**
   * 创建 IPC Server
   */ 
  _createIpcServer(app) {
    const IpcServer = require('./ipcServer');
    this[EEIpcServer] = new IpcServer(app);

    return this[EEIpcServer];
  },

  /**
   * 获取 IPC Server
   */
  getIpcServer() {
    return this[EEIpcServer] || null;
  },   

}


module.exports = EeSocket;