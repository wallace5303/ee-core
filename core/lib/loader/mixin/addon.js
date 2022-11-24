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

    opt = Object.assign({
      call: true,
      caseStyle: 'lower',
      directory: path.join(this.options.framework, 'addon')
    }, opt);

    const addonPaths = opt.directory;
    this.loadToContext(addonPaths, 'addon', opt);    
    
    this.timing.end('Load Addon');
  },
};


