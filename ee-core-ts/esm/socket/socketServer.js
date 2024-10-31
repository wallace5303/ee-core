import { Server } from "socket.io";
import * as is from "is-type-of";
import Log from "../log/index.js";
import Conf from "../config/cache.js";
import * as Ps from "../ps/index.js";
import Channel from "../const/channel.js";
'use strict';
/**
 * socket server
 */
class SocketServer {
    constructor(app) {
        this.app = app;
        this.socket = undefined;
        const options = Conf.getValue('socketServer');
        if (options.enable == false) {
            return;
        }
        let port = Ps.getSocketPort();
        if (!port) {
            throw new Error('[ee-core] [socket/socketServer] socekt port required, and must be a number !');
        }
        Log.coreLogger.info('[ee-core] [socket/socketServer] port is:', port);
        this.io = new Server(port, options);
        this.connec(options);
    }
    connec(opt = {}) {
        const app = this.app;
        this.io.on('connection', (socket) => {
            const channel = opt.channel || Channel.socketIo.partySoftware;
            this.socket = socket;
            socket.on(channel, async (message, callback) => {
                Log.coreLogger.info('[ee-core] [socket/socketServer] socket id:' + socket.id + ' message cmd: ' + message.cmd);
                try {
                    // 找函数
                    const cmd = message.cmd;
                    const args = message.args || message.params;
                    let fn = null;
                    if (is.string(cmd)) {
                        const actions = cmd.split('.');
                        let obj = app;
                        actions.forEach(key => {
                            obj = obj[key];
                            if (!obj)
                                throw new Error(`class or function '${key}' not exists`);
                        });
                        fn = obj;
                    }
                    if (!fn)
                        throw new Error('function not exists');
                    const result = await fn.call(app, args);
                    if (callback) {
                        callback(result);
                    }
                }
                catch (err) {
                    Log.coreLogger.error('[ee-core] [socket/socketServer] throw error:', err);
                }
            });
        });
    }
}
export default SocketServer;
