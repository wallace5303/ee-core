const is = require('is-type-of');
const fs = require('fs');
const utils = require('../../core/lib/utils');
const { logger } = require('../log');

module.exports = {

  /**
   * 加载单个文件(如果是函数，将被执行)
   *
   * @param {String} filepath - fullpath
   * @param {Array} inject - pass rest arguments into the function when invoke
   * @return {Object} exports
   * @since 1.0.0
   */
  loadFile (filepath, ...inject) {
    filepath = filepath && this.resolveModule(filepath);
    if (!filepath) {
      return null;
    }

    const ret = utils.loadFile(filepath);
    if (is.function(ret) && !is.class(ret) && !utils.isBytecodeClass(ret)) {
      ret = ret(...inject);
    }
    return ret;
  },

  /**
   * 模块的绝对路径
   */
  resolveModule(filepath) {
    let fullPath;
    try {
      fullPath = require.resolve(filepath);
    } catch (e) {
      let jscFile = filepath + '.jsc';
      if (fs.existsSync(jscFile)) {
        return jscFile;
      }
      return undefined;
    }

    return fullPath;
  },

  /**
   * 加载模块(子进程中使用)
   *
   * @param {String} filepath - fullpath
   * @return {Object} exports
   * @since 1.0.0
   */
  requireModule (filepath) {
    
    filepath = filepath && this.resolveModule(filepath);
    logger.info('111111111111 filepath:', filepath);
    if (!filepath) {
      return null;
    }

    const ret = utils.loadFile(filepath);
    logger.info('222222222222 ret:', ret);
    return ret;
  },  

}








