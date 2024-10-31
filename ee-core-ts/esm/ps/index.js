import path from "path";
import eis from "../utils/is.js";
export const initMode = function (mode) {
    if (process.env.EE_MODE !== undefined)
        return;
    return process.env.EE_MODE = mode ? mode : 'framework';
};
export const mode = function () {
    return process.env.EE_MODE;
};
export const verifyMode = function (mode) {
    if (['framework', 'module'].includes(mode)) {
        return true;
    }
    return false;
};
export const isFrameworkMode = function () {
    return (process.env.EE_MODE === 'framework');
};
export const isModuleMode = function () {
    return (process.env.EE_MODE === 'module');
};
export const allEnv = function () {
    return process.env;
};
export const env = function () {
    return process.env.EE_SERVER_ENV;
};
export const getEnv = this.env;
export const isProd = function () {
    return (process.env.EE_SERVER_ENV === 'prod');
};
export const isDev = function () {
    if (process.env.EE_SERVER_ENV === 'development' ||
        process.env.EE_SERVER_ENV === 'dev' ||
        process.env.EE_SERVER_ENV === 'local') {
        return true;
    }
    if (process.env.NODE_ENV === 'development' ||
        process.env.NODE_ENV === 'dev' ||
        process.env.NODE_ENV === 'local') {
        return true;
    }
    return false;
};
export const isRenderer = function () {
    return (typeof process === 'undefined' ||
        !process ||
        process.type === 'renderer');
};
export const isMain = function () {
    return (typeof process !== 'undefined' &&
        process.type === 'browser');
};
export const isForkedChild = function () {
    return (Number(process.env.ELECTRON_RUN_AS_NODE) === 1);
};
export const processType = function () {
    let type = '';
    if (this.isMain()) {
        type = 'browser';
    }
    else if (this.isRenderer()) {
        type = 'renderer';
    }
    else if (this.isForkedChild()) {
        type = 'child';
    }
    return type;
};
export const appName = function () {
    return process.env.EE_APP_NAME;
};
export const getHomeDir = function () {
    return process.env.EE_HOME;
};
export const getStorageDir = function () {
    const storageDir = path.join(this.getRootDir(), 'data');
    return storageDir;
};
export const getLogDir = function () {
    const dir = path.join(this.getRootDir(), 'logs');
    return dir;
};
export const getEncryptDir = function (basePath) {
    const base = basePath || process.cwd();
    const dir = path.join(base, 'public', 'electron');
    return dir;
};
export const getRootDir = function () {
    const appDir = this.isDev() ? process.env.EE_HOME : process.env.EE_APP_USER_DATA;
    return appDir;
};
export const getBaseDir = function () {
    return process.env.EE_BASE_DIR;
};
export const getElectronDir = function () {
    return process.env.EE_BASE_DIR;
};
export const getPublicDir = function () {
    const dir = path.join(process.env.EE_HOME, "public");
    return dir;
};
export const getExtraResourcesDir = function () {
    const execDir = this.getExecDir();
    const isPackaged = this.isPackaged();
    // 资源路径不同
    let dir = '';
    if (isPackaged) {
        // 打包后  execDir为 应用程序 exe\dmg\dep软件所在目录；打包前该值是项目根目录
        // windows和MacOs不一样
        dir = path.join(execDir, "resources", "extraResources");
        if (eis.macOS()) {
            dir = path.join(execDir, "..", "Resources", "extraResources");
        }
    }
    else {
        // 打包前
        dir = path.join(execDir, "build", "extraResources");
    }
    return dir;
};
export const getAppUserDataDir = function () {
    return process.env.EE_APP_USER_DATA;
};
export const getExecDir = function () {
    return process.env.EE_EXEC_DIR;
};
export const getUserHomeDir = function () {
    return process.env.EE_USER_HOME;
};
export const getUserHomeConfigDir = function () {
    // const filePath = path.join(this.getHomeDir(), 'package.json');
    // if (!fs.existsSync(filePath)) {
    //   throw new Error(filePath + ' is not found');
    // }
    // const pkg = JSON.parse(fs.readFileSync(filePath));
    // if (!pkg.name || pkg.name == "") {
    //   throw new Error(`name is required from ${filePath}`);
    // }
    const appname = this.appName();
    const cfgDir = path.join(this.getUserHomeDir(), ".config", appname);
    return cfgDir;
};
export const getUserHomeAppFilePath = function () {
    const p = path.join(this.getUserHomeConfigDir(), "app.json");
    return p;
};
export const getMainPort = function () {
    return parseInt(process.env.EE_MAIN_PORT) || 0;
};
export const getSocketPort = function () {
    return parseInt(process.env.EE_SOCKET_PORT) || 0;
};
export const getHttpPort = function () {
    return parseInt(process.env.EE_HTTP_PORT) || 0;
};
export const isPackaged = function () {
    return process.env.EE_IS_PACKAGED === 'true';
};
export const isEncrypted = function () {
    return process.env.EE_IS_ENCRYPTED === 'true';
};
export const isHotReload = function () {
    return process.env.HOT_RELOAD === 'true';
};
export const exit = function (code = 0) {
    return process.exit(code);
};
export const makeMessage = function (msg = {}) {
    let message = Object.assign({
        channel: '',
        event: '',
        data: {}
    }, msg);
    return message;
};
export const exitChildJob = function (code = 0) {
    try {
        let args = JSON.parse(process.argv[2]);
        if (args.type == 'childJob') {
            process.exit(code);
        }
    }
    catch (e) {
        process.exit(code);
    }
};
export const isChildJob = function () {
    try {
        let args = JSON.parse(process.argv[2]);
        if (args.type == 'childJob') {
            return true;
        }
    }
    catch (e) {
        return false;
    }
};
export const isChildPoolJob = function () {
    try {
        let args = JSON.parse(process.argv[2]);
        if (args.type == 'childPoolJob') {
            return true;
        }
    }
    catch (e) {
        return false;
    }
};
