'use strict';

const EeLoader = require('../core/index').EeLoader;

/**
 * App Loader
 * @see 
 */
class AppLoader extends EeLoader {

  /**
   * loadPlugin first, then loadConfig
   * @since 1.0.0
   */
  loadConfig() {
    super.loadConfig();
  }

  /**
   * Load all directories in convention
   * @since 1.0.0
   */
  load() {

    // app > plugin
    //this.loadService();

    // app
    this.loadController();
    
  }

}

module.exports = AppLoader;
