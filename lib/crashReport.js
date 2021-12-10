'use strict';

const { crashReporter } = require('electron');
const config = require('ee-core/config');

class CrashReport {
  constructor () {}

  /**
   * 安装模块
   */
  setup () {
    console.log('[ee-core] [lib-crashReport] [setup]');
    const options = config.get('crashReport');
    crashReporter.start(options);
  }

}  

module.exports = CrashReport;