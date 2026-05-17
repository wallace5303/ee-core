'use strict';

const fs = require('fs');
const is = require('../utils/is');
const { getUserHomeHiddenAppDir, getLogDir, getDataDir, getCustomAppDir } = require('../ps');
const { mkdir } = require('../utils/helper');
function loadDir() {
  initDir();
}

function initDir() {
  // 在记录日志前，单独捕获异常
  try {
    // 初始化自定义应用目录
    let customAppDir = getUserHomeHiddenAppDir();
    // 权限问题，openharmony 环境下，自定义应用目录
    if (is.openharmony()) {
      customAppDir = getCustomAppDir();
    }
    if (!fs.existsSync(customAppDir)) {
      mkdir(customAppDir, { mode: 0o755 });
    }
    const dataDir = getDataDir();
    if (!fs.existsSync(dataDir)) {
      mkdir(dataDir, { mode: 0o755 });
    }
    const logDir = getLogDir();
    if (!fs.existsSync(logDir)) {
      mkdir(logDir, { mode: 0o755 });
    }
  } catch (e) {
    console.error('[dir] initDir error:%s', e);
  }
}

module.exports = {
  loadDir
};