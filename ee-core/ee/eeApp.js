const path = require('path');
const fs = require('fs');
const assert = require('assert');
const is = require('is-type-of');
const Koa = require('koa');
const koaServe = require('koa-static');
const https = require('https');
const BaseApp = require('./baseApp');
const Log = require('../log');
const CoreElectron = require('../electron');
const CoreElectronApp = require('../electron/app');
const CoreElectronWindow = require('../electron/window');
const Conf = require('../config');
const Ps = require('../ps');
const Socket = require('../socket');
const GetPort = require('../utils/get-port');
const UtilsHelper = require('../utils/helper');
const HttpClient = require('../httpclient');

class EeApp extends BaseApp {
  constructor(options = {}) {
    super(options);

    // 兼容旧的api
    this.electron = CoreElectron;
    this.mainWindow;
  }

  /**
   * 生成端口
   */
  async createPorts() {
    if (Ps.isFrameworkMode() && Conf.isWebProtocol(this.config.mainServer)) {
      const mainPort = await GetPort({port: this.config.mainServer.port});
      process.env.EE_MAIN_PORT = mainPort;
      this.config.mainServer.port = mainPort;
    }

    if (this.config.socketServer.enable) {
      const socketPort = await GetPort({port: this.config.socketServer.port});
      process.env.EE_SOCKET_PORT = socketPort;
      this.config.socketServer.port = socketPort;
    }
    
    if (this.config.httpServer.enable) {
      const httpPort = await GetPort({port: this.config.httpServer.port});
      process.env.EE_HTTP_PORT = httpPort;
      this.config.httpServer.port = httpPort;
    }
    
    // 更新db配置
    Conf.setAll(this.config);
  }

  /**
   * 启动通信模块
   */
  async startSocket() {
    Socket.startAll(this);
  }
  
  /**
   * 创建electron应用
   */
  async createElectronApp() {
    if (!Ps.isFrameworkMode()) return;
    const newApp = CoreElectronApp.create();
    if (!newApp) {
      return
    }

    await this.electronAppReady();
  }
    
  /**
   * 创建应用主窗口
   */
  async createWindow() {

    // 初始化一个主窗口
    this.mainWindow = CoreElectronWindow.getMainWindow();

    await this.windowReady();
  
    await this._loderAddons();

    await this._loderPreload();

    this.selectAppType();
  }

  /**
   * 应用类型 （远程、html、单页应用）
   */
  async selectAppType() {
    let type = '';
    let url = '';

    // 远程模式
    const remoteConfig = this.config.remoteUrl;
    if (remoteConfig.enable == true) {
      type = 'remote_web';
      url = remoteConfig.url;
      this.loadMainUrl(type, url);
      return;
    }

    // 开发环境
    if (Ps.isDev()) {
      let modeInfo;
      let url;
      let load = 'url';
      const configFile = './electron/config/bin.js';

      const isBin = UtilsHelper.checkConfig(configFile);
      if (isBin) {
        const binConfig = UtilsHelper.loadConfig(configFile);
        const { frontend } = binConfig.dev;
        modeInfo = frontend;
      } else {
        // 兼容旧的 developmentMode
        const developmentModeConfig = this.config.developmentMode;
        const selectMode = developmentModeConfig.default;
        modeInfo = developmentModeConfig.mode[selectMode];
      }

      url = modeInfo.protocol + modeInfo.hostname + ':' + modeInfo.port;
      if (Conf.isFileProtocol(modeInfo)) {
        url = path.join(this.config.homeDir, modeInfo.directory, modeInfo.indexPath);
        load = 'file';
      }

      // 检查 UI serve是否启动，先加载一个boot page
      if (load == 'url') {
        const bootPage = path.join(__dirname, '..', 'html', 'boot.html');
        this.mainWindow.loadFile(bootPage);
        let count = 0;
        let frontendReady = false;
        const hc = new HttpClient();
        while(!frontendReady && count < 30){
          await UtilsHelper.sleep(1 * 1000);
          try {
            await hc.request(url, {
              method: 'GET',
              timeout: 1000,
            });
            frontendReady = true;
          } catch(err) {
            // console.log('The frontend service is starting');
          }

          count++;
        }

        if (frontendReady == false) {
          const bootFailurePage = path.join(__dirname, '..', 'html', 'failure.html');
          this.mainWindow.loadFile(bootFailurePage);
          Log.coreLogger.error(`[ee-core] Please check the ${url} !`);
          return;
        }
      }

      this.loadMainUrl('spa', url, load);
      return;
    }

    // 生产环境
    const mainServer = this.config.mainServer;
    if (Conf.isFileProtocol(mainServer)) {
      url = path.join(this.config.homeDir, mainServer.indexPath);
      this.loadMainUrl('spa', url, 'file');
    } else {
      this.loadLocalWeb('spa');
    }
  }

  /**
   * 加载本地前端资源
   */
  loadLocalWeb(mode, staticDir) {
    if (!staticDir) {
      staticDir = path.join(this.config.homeDir, 'public', 'dist')
    }

    const koaApp = new Koa();	
    koaApp.use(koaServe(staticDir));

    const mainServer = this.config.mainServer;
    let url = mainServer.protocol + mainServer.host + ':' + mainServer.port;

    const isHttps = mainServer.protocol == 'https://' ? true : false;
    if (isHttps) {
      const keyFile = path.join(this.config.homeDir, mainServer.ssl.key);
      const certFile = path.join(this.config.homeDir, mainServer.ssl.cert);
      assert(fs.existsSync(keyFile), 'ssl key file is required');
      assert(fs.existsSync(certFile), 'ssl cert file is required');

      const sslOpt = {
        key: fs.readFileSync(keyFile),
        cert: fs.readFileSync(certFile)
      };
      https.createServer(sslOpt, koaApp.callback()).listen(mainServer.port, (err) => {
        if (err) {
          Log.coreLogger.info('[ee-core] [lib/eeApp] createServer error: ', err);
          return
        }
        this.loadMainUrl(mode, url);
      });
    } else {
      // 使用 host port 避免绑定到0.0.0.0
      const koaOpt = {
        host: mainServer.host,
        port: mainServer.port
      }
      koaApp.listen(koaOpt, () => {
        this.loadMainUrl(mode, url);
      });
    }
  }

  /**
   * 主服务
   * @params load <string> value: "url" 、 "file"
   */
  loadMainUrl(type, url, load  =  'url') {
    const mainServer = this.config.mainServer;
    Log.coreLogger.info('[ee-core] Env: %s, Type: %s', this.config.env, type);
    Log.coreLogger.info('[ee-core] App running at: %s', url);
    if (load ==  'file')  {
      this.mainWindow.loadFile(url, mainServer.options)
      .then()
      .catch((err)=>{
        Log.coreLogger.error(`[ee-core] Please check the ${url} !`);
      });
    } else {
      this.mainWindow.loadURL(url, mainServer.options)
      .then()
      .catch((err)=>{
        Log.coreLogger.error(`[ee-core] Please check the ${url} !`);
      });
    }
  }

  /**
   * electron app退出
   */  
  async appQuit() {
    await this.beforeClose();
    CoreElectronApp.quit();
  }

  /**
   * 加载插件
   */
  async _loderAddons() {
    this.loader.loadAddons();

    // 注册主窗口Contents id
    const addonsCfg = this.config.addons;
    if (addonsCfg.window.enable && Ps.isFrameworkMode()) {
      const win = this.mainWindow;
      const addonWindow = this.addon.window;
      addonWindow.registerWCid('main', win.webContents.id);
    }
  }

  /**
   * 预加载模块
   */
  async _loderPreload() {
    let filepath = this.loader.resolveModule(path.join(this.config.baseDir, 'preload', 'index'));
    if (!filepath) return; 
    const fileObj = this.loader.loadFile(filepath);
    if (is.function(fileObj) && !is.generatorFunction(fileObj) && !is.asyncFunction(fileObj)) {
      fileObj();
    } else if (is.asyncFunction(fileObj)) {
      await fileObj();
    }
  }

  /**
   * module模式初始化
   */
  async InitModuleMode() {
    if (!Ps.isModuleMode()) return;

    await this._loderAddons();

    await this._loderPreload();
  }

  /**
   * electron app已经准备好，主窗口还未创建
   */
  async electronAppReady() {
    // do some things
  }

  /**
   * 主应用窗口已经创建
   */
  async windowReady() {
    // do some things
  }

  /**
   * app关闭之前
   */  
  async beforeClose() {
    // do some things
  }  
}

module.exports = EeApp;