export declare interface EEConfig {
    openDevTools: boolean;
    singleLock: boolean;
    windowsOption: WindowsOption;
    logger: LoggerOption;
    socketServer: SocketServer;
    httpServer: HttpServer;
    remote: Remote;
    mainServer: MainServer;
    exception: Exception;
    job: Jobs;
    cross: Cross;
}
export declare interface WindowsOption {
    title: string;
    width: number;
    height: number;
    minWidth: number;
    minHeight: number;
    webPreferences: {
        contextIsolation: boolean;
        nodeIntegration: boolean;
    };
    frame: boolean;
    show: boolean;
    icon: string;
};
export declare interface LoggerOption {
    type: string;
    dir: string;
    encoding: string;
    env: string;
    level: string;
    consoleLevel: string;
    disableConsoleAfterReady: boolean;
    outputJSON: boolean;
    buffer: boolean;
    appLogName: string;
    coreLogName: string;
    agentLogName: string;
    errorLogName: string;
    coreLogger: {};
    allowDebugAtProd: boolean;
    enablePerformanceTimer: boolean;
    rotator: string;
}
export declare interface SocketServer {
    enable: boolean;
    port: number;
    path: string;
    connectTimeout: number;
    pingTimeout: number;
    pingInterval: number;
    maxHttpBufferSize: number;
    transports: string[];
    cors: {
        origin: boolean;
    };
    channel: string;
}
export declare interface HttpServer {
    enable: boolean;
    https: {
        enable: boolean;
        key: string;
        cert: string;
    };
    protocol: string;
    host: string;
    port: number;
    cors: {
        origin: string;
    };
    body: {
        multipart: boolean;
        formidable: {
            keepExtensions: boolean;
        };
    };
    filterRequest: {
        uris: string[];
        returnData: string;
    };
}
export declare interface Remote {
    enable: boolean;
    url: string;
}
export declare interface MainServer {
    protocol: string;
    indexPath: string;
    options: {};
    takeover: string;
    loadingPage: string;
}
export declare interface Exception {
    mainExit: boolean;
    childExit: boolean;
    rendererExit: boolean;
}
export declare interface Jobs {
    messageLog: boolean;
}
export declare interface Cross {}
declare function _exports(): EEConfig;
export = _exports;
