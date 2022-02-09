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
     * package.json
     * @member {Object} Config#pkg
     * @see {appInfo#pkg}
     * @since 1.0.0
     */
    pkg: appInfo.pkg,

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
    appUserDataDir: appInfo.appUserDataDir
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

  return config;
};
