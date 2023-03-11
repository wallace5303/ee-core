const path = require('path');
const Ps = require('../ps');
const UtilsJson = require('./json');

/**
 * 获取项目根目录package.json
 */
exports.getPackage = function() {
  const json = UtilsJson.readSync(path.join(Ps.getHomeDir(), 'package.json'));
  
  return json;
};



