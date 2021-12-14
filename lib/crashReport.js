'use strict';

const { crashReporter } = require('electron');
const config = require('ee-core/lib/config');

class CrashReport {
  constructor () {}

  /**
   * 单例
   */
  static getInstance () {
    if (typeof this.instance === 'object') {
      return this.instance;
    }
    this.instance = new CrashReport();
    return this.instance;
  }

  /**
   * 安装模块
   */
  init () {
    console.log('[ee-core] [lib-crashReport] [init]');
    const options = config.get('crashReport');
    crashReporter.start(options);
  }

}  

module.exports = CrashReport;