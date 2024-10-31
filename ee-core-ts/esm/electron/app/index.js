import electron from "electron";
import EE from "../../ee/index.js";
import Log from "../../log/index.js";
import Electron from "../index.js";
import UtilsIs from "../../utils/is.js";
import Cross from "../../cross/index.js";
import Window from "../window/index.js";
const { app } = electron;
/**
 * CoreElectronApp (框架封装的electron app对象)
 */
const CoreElectronApp = {
    /**
     * 创建electron应用
     */
    async create() {
        const { CoreApp } = EE;
        const gotTheLock = app.requestSingleInstanceLock();
        if (!gotTheLock) {
            app.quit();
        }
        app.whenReady().then(() => {
            CoreApp.createWindow();
        });
        // 显示首次打开的窗口
        app.on('second-instance', () => {
            Log.coreLogger.info('[ee-core] [lib/eeApp] second-instance');
            Window.restoreMainWindow();
        });
        app.on('window-all-closed', () => {
            if (!UtilsIs.macOS()) {
                Log.coreLogger.info('[ee-core] [lib/eeApp] window-all-closed quit');
                CoreApp.appQuit();
            }
        });
        app.on('before-quit', () => {
            Electron.extra.closeWindow = true;
            // kill cross services
            Cross.killAll();
        });
        if (CoreApp.config.hardGpu.enable == false) {
            app.disableHardwareAcceleration();
        }
        return app;
    },
    /**
     * 退出app
     */
    quit() {
        app.quit();
    }
};
export default CoreElectronApp;
