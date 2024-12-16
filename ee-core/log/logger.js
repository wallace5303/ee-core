const Loggers = require('egg-logger').EggLoggers;
const assert = require('assert');
const dayjs = require('dayjs');
const path = require('path');
const Ps = require('../ps');
const ConfigCache = require('../config/cache');
const extend = require('../utils/extend');

let LogDate = 0;
const TmpFileName = {
  appLogName: '',
  coreLogName: '',
  errorLogName: '',
}

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
          rotator: 'day',
        },
        customLogger: {}
      }

      const sysConfig = ConfigCache.all();
      opt = extend(true, defaultConfig, {
        logger: sysConfig.logger,
        customLogger: sysConfig.customLogger || {}
      });
    } else {
      opt.logger = config.logger;
      opt.customLogger = config.customLogger;
    }
    // console.log('log---------', opt);

    assert(Object.keys(opt).length != 0, `logger config is null`);

    let rotateType = opt.logger.rotator;
    if (rotateType == 'day') {
      this._rotateByDay(opt);
    }

    const loggers = new Loggers(opt);

    return loggers;
  },

  /**
   * 按天分割
   */
  _rotateByDay(logOpt) {
    let now = parseInt(dayjs().format('YYYYMMDD'));
    if (LogDate != now) {
      LogDate = now;

      // 保存一个临时文件名，防止文件名按日期累加
      if (TmpFileName.appLogName.length == 0) {
        TmpFileName.appLogName = logOpt.logger.appLogName;
      }
      if (TmpFileName.coreLogName.length == 0) {
        TmpFileName.coreLogName = logOpt.logger.coreLogName;
      }
      if (TmpFileName.errorLogName.length == 0) {
        TmpFileName.errorLogName = logOpt.logger.errorLogName;
      }
      let appLogName = TmpFileName.appLogName;
      let coreLogName = TmpFileName.coreLogName;
      let errorLogName = TmpFileName.errorLogName;
      let appLogExtname = path.extname(appLogName);
      let coreLogExtname = path.extname(coreLogName);
      let errorLogExtname = path.extname(errorLogName);
      logOpt.logger.appLogName = path.basename(appLogName, appLogExtname) + '-' + now + appLogExtname;
      logOpt.logger.coreLogName = path.basename(coreLogName, coreLogExtname) + '-' + now + coreLogExtname;
      logOpt.logger.errorLogName = path.basename(errorLogName, errorLogExtname) + '-' + now + errorLogExtname;
    }
  },  
};