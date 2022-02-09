'use strict';

const { Server } = require('socket.io');
const getPort = require('get-port');
const constant = require('../constant');

class InitSocket {
  constructor () {
    console.log('[ee-core:socket] loaded socket');

    this.create();

  }

  /**
   * 创建
   */
  async create () {
    
    //setApi();
  
    // use api server
    const coredb = this.getCoreDB();
    let port = await getPort();
    //let port = await cdb.setIpcDynamicPort(ipcPort);
    // todo 
    port = port ? port : 7069;
    coredb.setItem('ipc_port', port);

    // 存到进程中
    process.env.EE_IPC_PORT = port;
    logger.coreLogger.info('[ee-core:socket] [initSocket] dynamic ipc port:', port);

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
   * @class getCoreDB
   */
  getCoreDB () {
    const db = require('../storage/index').JsonDB.connection('system');
    return db;
  }

}

module.exports = InitSocket;
