import * as IoServer from "socket.io";
import * as IoClient from "socket.io-client";
import Koa from "koa";
'use strict';
const EeSocket = {
    getServer: () => {
        //return socketServer.getInstance();
    },
    getClient: () => {
        //return socketClient.getInstance();
    }
};
export { IoServer };
export { IoClient };
export { EeSocket };
export { Koa };
export default {
    IoServer,
    IoClient,
    EeSocket,
    Koa
};
