import IoServer = require("socket.io");
import IoClient = require("socket.io-client");
export function loadSocket(): void;
export function getSocketServer(): any;
export function getHttpServer(): any;
export function getIpcServer(): any;
export { Koa, IoServer, IoClient };
