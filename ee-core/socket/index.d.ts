import IoServer = require("socket.io");
import IoClient = require("socket.io-client");
export declare function loadSocket(): void;
export declare function getSocketServer(): any;
export declare function getHttpServer(): any;
export declare function getIpcServer(): any;
export { Koa, IoServer, IoClient };
