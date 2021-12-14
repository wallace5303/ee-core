const eLog = require('electron-log');
const config = require('./config');

class ELogger {
  constructor () {
    console.log('[ee-core] [lib-eLogger] load');

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

    this.eLog = eLog;
  }

  /**
   * 单例
   */
  static getInstance () {
    if (typeof this.instance === 'object') {
      return this.instance.eLog;
    }
    this.instance = new ELogger();
    return this.instance.eLog;
  }

  /**
   * 兼容旧版本
   */
  static get () {
    return this.getInstance();
  }
}

module.exports = ELogger;