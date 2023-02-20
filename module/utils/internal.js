/**
 * 内部 Utils
 */

const copy = require('./copyto');
const ps = require('./ps');
const helper = require('./helper');
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
