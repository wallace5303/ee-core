const path = require('path');
const { app } = require('electron');
const chokidar = require('chokidar');

/**
 * 热重载
 */

module.exports = {
  
  install (eeApp) {
    if (eeApp.config.env == 'prod') {
      return;
    }
    const config = eeApp.config.hotReload;
    let watchPaths = config.watch;
    let opt = config.options;
    opt.cwd = config.homeDir;
    
		console.log('watchPaths:', watchPaths);
    console.log('opt:', opt);

		const watcher = chokidar.watch(watchPaths, opt);
	
		app.on('quit', () => {
			watcher.close();
		});

    watcher.on('change', filePath => {
      console.log('change path:', filePath);
      app.relaunch();
			app.exit(0);
    });
    // watcher.on('add', filePath => {
    //   console.log('add path:', filePath);
    // });
    // watcher.on('unlink', filePath => {
    //   console.log('unlink path:', filePath);
    // });
  }

}






















