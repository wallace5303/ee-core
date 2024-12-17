'use strict';

const Loggers = require('egg-logger').EggLoggers;
const dayjs = require('dayjs');
const path = require('path');
const { extend } = require('../utils/extend');
const Config = require('../config');
const Ps = require('../ps');

let LogDate = 0;
const TmpFileName = {
  appLogName: '',
  coreLogName: '',
  errorLogName: '',
}

// 创建
function create(config = {}) {
  let opt = {};
  
  if (Object.keys(config).length == 0) {
    const defaultConfig = {
      logger: {
        type: 'application',
        dir: Ps.getLogDir(),
        env: Ps.env(),
        consoleLevel: 'INFO',
        disableConsoleAfterReady: !Ps.isDev(),
        coreLogger: {},
        allowDebugAtProd: false,
        agentLogName: 'ee-agent.log',
        rotator: 'day',
      },
      customLogger: {}
    };
    const sysConfig = Config.getConfig();
    opt = extend(true, defaultConfig, {
      logger: sysConfig.logger,
      customLogger: sysConfig.customLogger || {}
    });
  } else {
    opt.logger = config.logger;
    opt.customLogger = config.customLogger;
  }

  if (Object.keys(opt).length == 0) {
    throw new Error("logger config is null");
  }

  let rotateType = opt.logger.rotator;
  if (rotateType == 'day') {
    opt = _rotateByDay(opt);
  }
  console.log('log2---------', opt);
  const loggers = new Loggers(opt);

  return loggers;
}

/**
 * 按天分割
 */
function _rotateByDay(logOpt) {
  const now = parseInt(dayjs().format('YYYYMMDD'));
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

    const {appLogName, coreLogName, errorLogName} = TmpFileName;
    const appLogExtname = path.extname(appLogName);
    const coreLogExtname = path.extname(coreLogName);
    const errorLogExtname = path.extname(errorLogName);
    logOpt.logger.appLogName = path.basename(appLogName, appLogExtname) + '-' + now + appLogExtname;
    logOpt.logger.coreLogName = path.basename(coreLogName, coreLogExtname) + '-' + now + coreLogExtname;
    logOpt.logger.errorLogName = path.basename(errorLogName, errorLogExtname) + '-' + now + errorLogExtname;
  }

  return logOpt;
}

module.exports = {
  create
};