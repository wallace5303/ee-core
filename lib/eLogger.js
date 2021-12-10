const eLog = require('electron-log');
const config = require('../config');

class ELogger {
  constructor () {}

  /**
   * 安装模块
   */
  setup () {
    console.log('[ee-core] [lib-eLogger] [setup]');
    let logConfig = config.get('log');
    for (let transport in logConfig) {
      const configInfo = logConfig[transport];
      if (transport === 'file') {
        eLog.transports.file.level = configInfo.level;
        eLog.transports.file.file = configInfo.fileName;
        eLog.transports.file.fileName = configInfo.fileName;
        eLog.transports.file.format = configInfo.format;
        eLog.transports.file.maxSize = configInfo.maxSize;
      }  
    }
  }

  get () {
    return new Log();
  }
}

module.exports = ELogger;