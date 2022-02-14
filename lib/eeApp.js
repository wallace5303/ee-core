const path = require('path');
const getPort = require('get-port');
const startCluster = require('egg-cluster').startCluster;
const {app, BrowserWindow, BrowserView, Menu} = require('electron');
const BaseApp = require('./baseApp');

class EeApp extends BaseApp {
  constructor(options = {}) {
    super(options);

    this.mainWindow = null;

    this.tray = null;

    this.winCanQuit = false;
  }

  /**
   * 生成端口
   */
  async createPorts () {
    const ipcPort = await getPort();
    const eggPort = this.config.env === 'prod' ? await getPort() : this.config.egg.port;
    this.config.egg.port = eggPort;
    process.env.EE_IPC_PORT = ipcPort;
    process.env.EE_EGG_PORT = eggPort;
    this.coreLogger.info('[ee-core:EeApp] [createPorts] ipc port:', ipcPort);
    this.coreLogger.info('[ee-core:EeApp] [createPorts] egg port:', eggPort);
    
    // 更新db配置
    this.getCoreDB().setItem('ipc_port', ipcPort);
    this.getCoreDB().setItem('config', this.config);
  }

  /**
   * 启动通信模块
   */
  startSocket () {
    const app = this;
    const socket = require('./socket/start');
    socket.create(app);
  }
  
  async createWindow () {
    const winOptions = this.config.windowsOption;
    this.mainWindow = new BrowserWindow(winOptions);
  
    // DevTools
    if (!app.isPackaged && this.config.openDevTools) {
      this.mainWindow.webContents.openDevTools();
    }

    // hidden menu
    if (this.config.openAppMenu) {
      Menu.setApplicationMenu(null);
    }

    // loading html
    this.loadingView(winOptions);
  
    // options register
    //await this.preferences();
  
    // egg server
    await this.startServer(this.config.egg);
  
    return this.mainWindow;
  }
  
  async startServer (options) {
    this.coreLogger.info('[ee-core:EeApp] [startServer] options', options);
    const protocol = 'http://';
    let startRes = null;
    let url = null;
    const remoteConfig = this.config.remoteUrl;
    if (remoteConfig.enable) {
      url = remoteConfig.url;
      this.loadMainUrl(url);
      return true;
    }
    
    if (this.config.env === 'prod') {
      url = protocol + options.hostname + ':' + options.port
    } else {
      const developmentModeConfig = this.config.developmentMode;
      const selectMode = developmentModeConfig.default;
      const modeInfo = developmentModeConfig.mode[selectMode];
      url = protocol + modeInfo.hostname + ':' + modeInfo.port;
    }
    this.coreLogger.info('[ee-core:EeApp] frontend server :', url)
    startRes = await this.startEgg(options).then((res) => res, (err) => err);
    this.coreLogger.info('[ee-core:EeApp] [startServer] egg startRes:', startRes)
    if (startRes === 'success') {
      this.loadMainUrl(url);
      return true;
    }
    
    app.relaunch();
  }

  /**
   * White screen optimization
   */
  loadingView (winOptions) {
    const self = this;
    const loadingBrowserView = new BrowserView();
    this.mainWindow.setBrowserView(loadingBrowserView);
    loadingBrowserView.setBounds({
      x: 0,
      y: 0,
      width: winOptions.width,
      height: winOptions.height
    });

    // loading html
    const loadingHtml = path.join('file://', this.eeCoreDir, 'resource', 'loading.html');
    loadingBrowserView.webContents.loadURL(loadingHtml);
    console.log('loadingHtml:', loadingHtml);
    
    this.mainWindow.webContents.on('dom-ready', async (event) => {
      self.mainWindow.removeBrowserView(loadingBrowserView);
    });
  }

  loadMainUrl (url) {
    this.mainWindow.loadURL(url);
  }

  startEgg (argv) {
    let homeDir = this.homeDir;
    argv.baseDir = homeDir;
    argv.framework = path.join(homeDir, 'node_modules', 'egg');

    const appName = this.config.name;
    argv.title = argv.title || `egg-server-${appName}`;


    // normalize env
    // 目前没有用到，不用修改；想要修改的话，区分打包前后的路径？
    // env.HOME = HOME; // 这个home不能修改，因为自动升级功能会用到（win没有问题，mac有权限问题）
    //env.NODE_ENV = 'production';

    // 更新缓存配置  
    this.getCoreDB().setItem('config', this.config);

    const ignoreKeys = [ '_', '$0', 'env', 'daemon', 'stdout', 'stderr', 'timeout', 'ignore-stderr', 'node' ];
    const clusterOptions = this.stringify(argv, ignoreKeys);
    const options = JSON.parse(clusterOptions);

    return new Promise((resolve, reject) => {
      startCluster(options, function(){
        resolve('success');
      });
    });
  }

  limitOneWindow () {
    const gotTheLock = app.requestSingleInstanceLock();
    if (!gotTheLock) {
      this.appQuit();
    }
  }

  appQuit () {
    app.quit();
  }

  stringify(obj, ignore) {
    const result = {};
    Object.keys(obj).forEach(key => {
      if (!ignore.includes(key)) {
        result[key] = obj[key];
      }
    });
    return JSON.stringify(result);
  }

  /**
   * Catch exception
   */
  catchLog () {
    const self = this;
    process.on('uncaughtException', function(err) {
      self.logger.error(err);
    });
  }
}

module.exports = EeApp;