const { app } = require('electron');
const path = require('path');
const fs = require('fs');
const Utils = require('../utils');
const Ps = require('../ps');
const EE = require('../ee');
const UtilsCore = require('../core/lib/utils');
const Loader = require('../loader');
const UtilsPargv = require('../utils/pargv');

class ElectronEgg {

  constructor(mode) {
    this.mode = mode || 'framework';
    this._create();
  }

  /**
   * create ElectronEgg app
   */  
  _create() {
    if (!Ps.verifyMode(this.mode)) {
      throw new Error(`The mode supports only (framework | module) !`);
    }
    Ps.initMode(this.mode);

    // env 可能为空
    const argsObj = UtilsPargv(process.argv);
    let isDev = false;
    if ( argsObj['env'] == 'development' || argsObj['env'] === 'dev' || argsObj['env'] === 'local' ) {
      isDev = true;
    }

    // module mode
    if (Ps.isModuleMode()) {
      const { Application } = EE;
      new Application();
      return;
    }

    let baseDir = path.join(app.getAppPath(), 'electron');
    if (!isDev && Utils.isEncrypt(app.getAppPath())) {
      baseDir = Ps.getEncryptDir(app.getAppPath());
    }

    let indexFile = path.join(baseDir, 'index');
    indexFile = Loader.resolveModule(indexFile);
    if (!fs.existsSync(indexFile)) {
      throw new Error(`The ${indexFile} file does not exist`);
    }

    const EEApp = UtilsCore.loadFile(indexFile);
    EE.app = new EEApp();
  }
}

module.exports = ElectronEgg;