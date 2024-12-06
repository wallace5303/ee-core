'use strict';

const { app } = require('electron');
const path = require('path');
const fs = require('fs');
const Utils = require('../utils');
const Ps = require('../ps');
const UtilsCore = require('../core/lib/utils');
const Loader = require('../loader');
const { parseArgv } = require('../utils/pargv');
const { Appliaction } = require('../app');

class ElectronEgg {

  constructor() {
    this._create();
  }

  /**
   * create ElectronEgg app
   */  
  _create() {

    // init application
    new Appliaction();
    return;

    // env 可能为空
    const argsObj = parseArgv(process.argv);
    // console.log('argsObj', argsObj);
    // return;
    let isDev = false;
    if ( argsObj['env'] == 'development' || argsObj['env'] === 'dev' || argsObj['env'] === 'local' ) {
      isDev = true;
    }



    let electronDir = path.join(app.getAppPath(), 'electron');
    if (!isDev && Utils.isEncrypt(app.getAppPath())) {
      electronDir = Ps.getEncryptDir(app.getAppPath());
    }

    let indexFile = path.join(electronDir, 'index');
    indexFile = Loader.resolveModule(indexFile);
    if (!fs.existsSync(indexFile)) {
      throw new Error(`The ${indexFile} file does not exist`);
    }

    const EEApp = UtilsCore.loadFile(indexFile);
    EE.app = new EEApp();
  }
}

module.exports = {
  ElectronEgg
}