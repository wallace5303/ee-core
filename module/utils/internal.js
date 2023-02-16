/**
 * 内部 Utils
 */

const copy = require('./copyto');
const ps = require('./ps');
const helper = require('../utils/helper');
const storage = require('../storage');

/**
 * process function
 */
copy(ps)
.and(helper)
.to(exports);

/**
 * 获取 coredb
 */
exports.getCoreDB = function() {
  const coreDB = storage.connection('system');
  return coreDB;
}

/**
 * 获取 当前环境
 */
exports.getEnv = function() {
  let env = process.env.EE_SERVER_ENV || null;
  if (!env) {
    const cdb = this.getCoreDB();
    env = cdb.getItem('config').env;
  }

  return env;
}

/**
 * 获取 base目录
 */
exports.getBaseDir = function() {
  let basePath = process.env.EE_BASE_DIR || null;
  if (!basePath) {
    const cdb = this.getCoreDB();
    basePath = cdb.getItem('config').baseDir;
  }

  return basePath;
}
