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
    type: 'application',
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
    rotator: 'none',
  };

  /**
   * customLogger options
   * @member Config#customLogger
   * 
   */  
  config.customLogger = {}

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

  /**
   * 应用模式配置
   */
  config.developmentMode = {
    default: 'vue',
    mode: {
      vue: {
        protocol: 'http://',
        hostname: 'localhost',
        port: 8080
      },
      react: {
        protocol: 'http://',
        hostname: 'localhost',
        port: 3000
      },
      html: {
        protocol: 'http://',
        hostname: 'localhost',
        indexPage: 'index.html'
      },
    }
  };

  /* 内置socket服务 */
  config.socketServer = {
    enable: false, // 是否启用
    port: 7070, // 默认端口（如果端口被使用，则随机获取一个）
    path: "/socket.io/", // 路径名称
    connectTimeout: 45000, // 客户端连接超时时间
    pingTimeout: 30000, // 心跳检测超时时间
    pingInterval: 25000, // 心跳检测间隔
    maxHttpBufferSize: 1e8, // 每条消息的数据大小 1M
    transports: ["polling", "websocket"], // http轮询和websocket
    cors: {
      origin: true, // http协议时，要设置跨域 类型 Boolean String RegExp Array Function
    }
  };
  
  /* 内置http服务 */
  config.httpServer = {
    enable: false, // 是否启用
    https: {
      enable: false,
      key: '',
      cert: ''
    },
    protocol: 'http://',
    host: 'localhost',
    port: 7071, // 默认端口（如果端口被使用，则随机获取一个）
    cors: {
      origin: "*"
    },
    body: {
      multipart: true, // 文件类型
    },
    filterRequest: {
      uris:  [],
      returnData: ''
    }
  };  

  /* 主进程加载的地址 */
  config.mainServer = {
    protocol: 'http://', // http:// | https:// | file://
    indexPath: '/public/dist/index.html',
    host: 'localhost',
    port: 7072, // 默认端口（如果端口被使用，则随机获取一个）
    options: {},
    ssl: {
      key: '',
      cert: ''
    }
  }; 

  /**
   * 应用程序顶部菜单
   * boolean | string
   * true, false, 'dev-show'(dev环境显示，prod环境隐藏)
   */
  config.openAppMenu = true; 

  /**
   * 硬件加速
   */
  config.hardGpu = {
    enable: false
  };

  /**
   * TODO storage
   */
  config.storage = {
    dir: path.join(appInfo.root, 'data'),
  };

  /**
   * loading页（废弃）
   */
  config.loadingPage = false;

  /**
   * addons
   */
  config.addons = {
    window: {
      enable: true,
    }
  }; 

  /**
   * 异常捕获
   */
  config.exception = {
    mainExit: false,
    childExit: true,
    rendererExit: true,
  };

  return config;
};
