const path = require('path');

module.exports = {

  /**
   * Load app/addon
   * @param {Object} opt - LoaderOptions
   * @function 
   * @since 1.0.0
   */
  loadAddon(opt) {
    this.timing.start('Load Addon');

    // 加载ee-core的插件 和 用户插件
    const directorys = [
      path.join(this.options.framework, 'addon'),
      path.join(this.options.baseDir, 'addon'),
    ]
    opt = Object.assign({
      call: true,
      caseStyle: 'lower',
      directory: directorys
    }, opt);

    const addonPaths = opt.directory;
    this.loadToContext(addonPaths, 'addon', opt);    
    
    this.timing.end('Load Addon');
  },
};


