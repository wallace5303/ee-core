const is = require('is-type-of');
const fs = require('fs');
const { utils } = require('../../core');

module.exports = {

  /**
   * 加载单个文件
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

  // /**
  //  * 模块的绝对路径
  //  */
  // isAbsolute(filepath) {
  //   name = filepath.replace(/[/\\]/g, '/');
  //   if (name.indexOf('/') !== -1) {
  //     const isAbsolute = path.isAbsolute(name);
  //     if (isAbsolute) {
  //       mode = 'absolute';
  //     } else {
  //       mode = 'relative';
  //     }
  //     return mode;
  //   }
  // },

}








