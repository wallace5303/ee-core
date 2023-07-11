const { app } = require('electron');
const path = require('path');
const fs = require('fs');
const Utils = require('../utils');
const Ps = require('../ps');
const EE = require('../ee');
const UtilsCore = require('../core/lib/utils');
const Loader = require('../loader');

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

    // module mode
    if (Ps.isModuleMode()) {
      const { Application } = EE;
      new Application();
      return;
    }

    let baseDir = path.join(app.getAppPath(), 'electron');
    if (Utils.isEncrypt(app.getAppPath())) {
      baseDir = Ps.getEncryptDir(app.getAppPath());
    }

    let indexFile = path.join(baseDir, 'index');
    indexFile = Loader.resolveModule(indexFile);
    if (!fs.existsSync(indexFile)) {
      throw new Error(`The ${indexFile} file does not exist`);
    }

    const EEApp = UtilsCore.loadFile(indexFile);
    EE.app = new EEApp(this.env);
  }
}

module.exports = ElectronEgg;