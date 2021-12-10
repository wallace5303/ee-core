'use strict';

const { crashReporter } = require('electron');
const config = require('ee-core/config');

/**
 * 安装模块
 */
exports.setup = function () {
  console.log('[electron-lib-crashReport] [setup]');
	const options = config.get('crashReport');
  crashReporter.start(options);
}