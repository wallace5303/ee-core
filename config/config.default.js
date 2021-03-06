'use strict';
const path = require('path');

/**
 * The configuration of ee application, can be access by `app.config`
 * @class Config
 * @since 1.0.0
 */

module.exports = appInfo => {

  const config = {

    /**
     * The environment of ee
     * @member {String} Config#env
     * @see {appInfo#env}
     * @since 1.0.0
     */
    env: appInfo.env,

    /**
     * The name of the application
     * @member {String} Config#name
     * @see {appInfo#name}
     * @since 1.0.0
     */
    name: appInfo.name,

    /**
     * The current directory of the application
     * @member {String} Config#baseDir
     * @see {appInfo#baseDir}
     * @since 1.0.0
     */
    baseDir: appInfo.baseDir,

    /**
     * The current HOME directory
     * @member {String} Config#HOME
     * @see {appInfo#HOME}
     * @since 1.0.0
     */
    HOME: appInfo.home,

    /**
     * The directory of server running. You can find `application_config.json` under it that is dumpped from `app.config`.
     * @member {String} Config#rundir
     * @default
     * @since 1.0.0
     */
    rundir: path.join(appInfo.baseDir, 'run'),

    /**
     * dump config
     *
     * It will ignore special keys when dumpConfig
     *
     * @member Config#dump
     * @property {Set} ignore - keys to ignore
     */
    dump: {
      ignore: new Set([
        'pass', 'pwd', 'passd', 'passwd', 'password', 'keys', 'masterKey', 'accessKey',
        // ignore any key contains "secret" keyword
        /secret/i,
      ]),
    },

    /**
     * application home directory
     * @member {String} Config#homeDir
     * @default
     * @since 1.0.0
     */
    homeDir: appInfo.home,

    /**
     * application data & logs directory by env
     * @member {String} Config#root
     * @default
     * @since 1.0.0
     */
    root: appInfo.root,

    /**
     * application data directory
     * @member {String} Config#appUserDataDir
     * @default
     * @since 1.0.0
     */
    appUserDataDir: appInfo.appUserDataDir,

    /**
     * system user home dir 
     * @member {String} Config#userHome
     */
    userHome: appInfo.userHome,

    /**
      * application version
      * @member {String} Config#appVersion
      */
    appVersion: appInfo.appVersion,

    /**
      * application package status
      * @member {boolean} Config#isPackaged
      */      
    isPackaged: appInfo.isPackaged,

    /**
      * application exec file dir
      * @member {String} Config#execDir
      */  
    execDir: appInfo.execDir
  };

  /**
   * logger options
   * @member Config#logger
   * @property {String} dir - directory of log files
   * @property {String} encoding - log file encoding, defaults to utf8
   * @property {String} level - default log level, could be: DEBUG, INFO, WARN, ERROR or NONE, defaults to INFO in production
   * @property {String} consoleLevel - log level of stdout, defaults to INFO in local serverEnv, defaults to WARN in unittest, defaults to NONE elsewise
   * @property {Boolean} disableConsoleAfterReady - disable logger console after app ready. defaults to `false` on local and unittest env, others is `true`.
   * @property {Boolean} outputJSON - log as JSON or not, defaults to false
   * @property {Boolean} buffer - if enabled, flush logs to disk at a certain frequency to improve performance, defaults to true
   * @property {String} errorLogName - file name of errorLogger
   * @property {String} coreLogName - file name of coreLogger
   * @property {String} agentLogName - file name of agent worker log
   * @property {Object} coreLogger - custom config of coreLogger
   * @property {Boolean} allowDebugAtProd - allow debug log at prod, defaults to false
   * @property {Boolean} enablePerformanceTimer - using performance.now() timer instead of Date.now() for more more precise milliseconds, defaults to false. e.g.: logger will set 1.456ms instead of 1ms.
   */
  config.logger = {
    dir: path.join(appInfo.root, 'logs'),
    encoding: 'utf8',
    env: appInfo.env,
    level: 'INFO',
    consoleLevel: 'INFO',
    disableConsoleAfterReady: appInfo.env !== 'local' && appInfo.env !== 'unittest',
    outputJSON: false,
    buffer: true,
    appLogName: `ee.log`,
    coreLogName: 'ee-core.log',
    agentLogName: 'ee-agent.log',
    errorLogName: `ee-error.log`,
    coreLogger: {},
    allowDebugAtProd: false,
    enablePerformanceTimer: false,
  };

  /**
   * The option for httpclient
   * @member Config#httpclient
   * @property {Boolean} enableDNSCache - Enable DNS lookup from local cache or not, default is false.
   * @property {Boolean} dnsCacheLookupInterval - minimum interval of DNS query on the same hostname (default 10s).
   *
   * @property {Number} request.timeout - httpclient request default timeout, default is 5000 ms.
   *
   * @property {Boolean} httpAgent.keepAlive - Enable http agent keepalive or not, default is true
   * @property {Number} httpAgent.freeSocketTimeout - http agent socket keepalive max free time, default is 4000 ms.
   * @property {Number} httpAgent.maxSockets - http agent max socket number of one host, default is `Number.MAX_SAFE_INTEGER` @ses https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER
   * @property {Number} httpAgent.maxFreeSockets - http agent max free socket number of one host, default is 256.
   *
   * @property {Boolean} httpsAgent.keepAlive - Enable https agent keepalive or not, default is true
   * @property {Number} httpsAgent.freeSocketTimeout - httpss agent socket keepalive max free time, default is 4000 ms.
   * @property {Number} httpsAgent.maxSockets - https agent max socket number of one host, default is `Number.MAX_SAFE_INTEGER` @ses https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER
   * @property {Number} httpsAgent.maxFreeSockets - https agent max free socket number of one host, default is 256.
   */
  config.httpclient = {
    enableDNSCache: false,
    dnsCacheLookupInterval: 10000,
    dnsCacheMaxLength: 1000,

    request: {
      timeout: 5000,
    },
    httpAgent: {
      keepAlive: true,
      freeSocketTimeout: 4000,
      maxSockets: Number.MAX_SAFE_INTEGER,
      maxFreeSockets: 256,
    },
    httpsAgent: {
      keepAlive: true,
      freeSocketTimeout: 4000,
      maxSockets: Number.MAX_SAFE_INTEGER,
      maxFreeSockets: 256,
    },
  };

  /* ??????socket?????? */
  config.socketServer = {
    enable: false, // ????????????
    port: 7070, // ???????????????????????????????????????????????????????????????
    path: "/socket.io/", // ????????????
    connectTimeout: 45000, // ???????????????????????????
    pingTimeout: 30000, // ????????????????????????
    pingInterval: 25000, // ??????????????????
    maxHttpBufferSize: 1e8, // ??????????????????????????? 1M
    transports: ["polling", "websocket"], // http?????????websocket
    cors: {
      origin: true, // http??????????????????????????? ?????? Boolean String RegExp Array Function
    }
  };
  
  /* ??????http?????? */
  config.httpServer = {
    enable: false, // ????????????
    protocol: 'http://',
    host: '127.0.0.1',
    port: 7071, // ???????????????????????????????????????????????????????????????
    cors: {
      origin: "*"
    },
    body: {
      multipart: true, // ????????????
    }
  };  

  /* ???????????????????????? */
  config.mainServer = {
    protocol: 'http://',
    host: '127.0.0.1',
    port: 7072, // ???????????????????????????????????????????????????????????????
  }; 

  /**
   * ????????????????????????
   * boolean | string
   * true, false, 'dev-show'(dev???????????????prod????????????)
   */
  config.openAppMenu = true; 

  /**
   * ????????????
   */
  config.hardGpu = {
    enable: false
  }; 

  /**
   * loading???????????????
   */
  config.loadingPage = false;  

  return config;
};
