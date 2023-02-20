const Loggers = require('egg-logger').EggLoggers;
const assert = require('assert');
const Ps = require('../utils/ps');
const Storage = require('../storage');

module.exports = {

  /**
   * 创建
   */
  create(config = {}) {
    let opt = {};
    
    if (Object.keys(config).length == 0) {
      const defaultConfig = {
        logger: {
          type: 'application',
          dir: Ps.getLogDir(),
          encoding: 'utf8',
          env: Ps.env(),
          level: 'INFO',
          consoleLevel: 'INFO',
          disableConsoleAfterReady: !Ps.isDev(),
          outputJSON: false,
          buffer: true,
          appLogName: `ee.log`,
          coreLogName: 'ee-core.log',
          agentLogName: 'ee-agent.log',
          errorLogName: `ee-error.log`,
          coreLogger: {},
          allowDebugAtProd: false,
          enablePerformanceTimer: false,
        },
        customLogger: {}
      }
      const sysConfig = this._getCoreDB().getItem('config');
      opt = Object.assign(defaultConfig, {
        logger: sysConfig.logger,
        customLogger: sysConfig.customLogger || {}
      });
    } else {
      opt.logger = config.logger;
      opt.customLogger = config.customLogger;
    }
    //console.log('log---------', config);

    assert(Object.keys(opt).length != 0, `logger config is null`);

    const loggers = new Loggers(opt);

    return loggers;
  },

  /**
   * 获取 coredb
   */
  _getCoreDB() {
    const coreDB = Storage.connection('system');
    return coreDB;
  }
};