import electron from "electron";
import path from "path";
import fs from "fs";
import * as Utils from "../utils/index.js";
import * as Ps from "../ps/index.js";
import EE from "../ee/index.js";
import UtilsCore from "../core/lib/utils/index.js";
import Loader from "../loader/index.js";
import UtilsPargv from "../utils/pargv.js";
const { app } = electron;
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
        if (argsObj['env'] == 'development' || argsObj['env'] === 'dev' || argsObj['env'] === 'local') {
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
export default ElectronEgg;
