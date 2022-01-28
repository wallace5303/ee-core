'use strict';

const fs = require('fs');
const http = require('http');
const path = require('path');
const _ = require('lodash');
const { Server } = require('socket.io');
const getPort = require('get-port');
const constant = require('./constant');
const logger = require('./logger').getInstance();

class Socket {
  constructor () {
    logger.coreLogger.info('[ee-core:socket] loaded socket');

    this.initSocket();

  }

  /**
   * 单例
   */
  static getInstance () {
    if (typeof this.instance === 'object') {
      return this.instance;
    }
    this.instance = new Socket();
    return this.instance;
  }

  /**
   * 初始化模块
   */
  async initSocket () {
    
    //setApi();
  
    // use api server
    const storage = require('./storage').getInstance('system');
    const ipcPort = await getPort();
    let port = await storage.setIpcDynamicPort(ipcPort);
    logger.coreLogger.info('[ee-core:socket] [initSocket] dynamic ipc port:', port);
    const listen = '127.0.0.1';
    port = port ? port : 7069;
  
    // const server = http.createServer(function(req, res) {
    //   logger.coreLogger.info('[ee-core:socket] http_server command received', { method: req.method, url: req.url });
    // });
  
    // socket io
    //const io = socketIo(server);
    const io = new Server(port);
    io.on('connection', (socket) => {
      let channel = constant.socketIo.channel.eggIoEe;

      socket.on(channel, (message, callback) => {
        logger.coreLogger.info('[ee-core:socket] socket id:' + socket.id + ' message cmd: ' + message.cmd);


        // const data = apis[message.cmd](...message.params);
        // if (data && typeof data.then === 'function') { // 判断是否是异步
        //   data.then((data) => {
        //     const result = {
        //       err: null,
        //       data: data,
        //     };
        //     callback(result)
        //   });
        // } else {
        //   const result = {
        //     err: null,
        //     data: data,
        //   };
        //   callback(result);
        // }
      });
    });
  
    // server.listen(port, listen, function() {
    //   logger.coreLogger.info('[api] [setup] server is listening on', `${listen}:${port}`);
    // });
  
    return true;
  }

  /**
   * getStorage
   */
  getStorage () {
    return require('./storage').getInstance('system');
  }

  /**
   * 加载用户的文件 todo
   */
  setApi () {
    const apiDir = path.normalize('../../../electron/apis');
    fs.readdirSync(apiDir).forEach(function(filename) {
      if (path.extname(filename) === '.js' && filename !== 'index.js') {
        const name = path.basename(filename, '.js');
        const fileObj = require(`../apis/${filename}`);
        _.map(fileObj, function(fn, method) {
          let methodName = getApiName(name, method);
          apis[methodName] = fn;
        });
      }
    });
  }

  /**
   * get api method name
   * ex.) jsname='user' method='get' => 'user.get'
   * @param {String} jsname
   * @param {String} method
   */
  getApiName (jsname, method) {
    return jsname + '.' + method;
  }


}

module.exports = Socket;
