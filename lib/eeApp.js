const path = require('path');
const getPort = require('get-port');
const startCluster = require('egg-cluster').startCluster;
const {app, BrowserWindow, BrowserView, Menu} = require('electron');
const BaseApp = require('./baseApp');
const is = require('is-type-of');

class EeApp extends BaseApp {
  constructor(options = {}) {
    super(options);

    this.electron = {
      mainWindow: null,
      tray: null
    };

    //this._mainWindow = null;
    //this.electron.mainWindow = null;

    //this.electron.tray = null;
    // global.APP_TRAY = null;
    //this.preferences = {};
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
    const socket = require('./socket/start');
    socket(this);
  }
  
  /**
   * 创建electron应用
   */
  async createElectronApp () {
    const self = this;
    await this.limitOneWindow();

    app.on('second-instance', (event) => {
      if (self.electron.mainWindow) {
        if (self.electron.mainWindow.isMinimized()) {
          self.electron.mainWindow.restore();
        }
        self.electron.mainWindow.focus()
      }
    })
  
    app.whenReady().then(() => {
      self.createWindow();
      app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) {
          self.createWindow();
        }
      })
    })
    
    app.on('window-all-closed', function () {
      if (process.platform !== 'darwin') {
        self.coreLogger.info('[Appliaction] [initialize] window-all-closed quit');
        self.appQuit();
      }
    })
  }
    
  /**
   * 创建应用主窗口
   */
  async createWindow () {
    const winOptions = this.config.windowsOption;
    this.electron.mainWindow = new BrowserWindow(winOptions);
  
    // DevTools
    if (!app.isPackaged && this.config.openDevTools) {
      this.electron.mainWindow.webContents.openDevTools();
    }

    // 隐藏菜单
    if (this.config.openAppMenu) {
      Menu.setApplicationMenu(null);
    }

    this.loadingView(winOptions);

    await this.windowReady();
  
    await this.loderPreload();

    //this.loader.loadElectron();
    
    await this.startEggServer(this.config.egg);
  }

  /**
   * 加载已经实现的功能
   */
  async loadPreference () {
    const preferences = require('./preferences');
    return await preferences(this);
  }

  /**
   * 创建egg服务
   */  
  async startEggServer (options) {
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
   * 加载loading页面
   */
  loadingView (winOptions) {
    const self = this;
    const loadingBrowserView = new BrowserView();
    this.electron.mainWindow.setBrowserView(loadingBrowserView);
    loadingBrowserView.setBounds({
      x: 0,
      y: 0,
      width: winOptions.width,
      height: winOptions.height
    });

    // loading html
    const loadingHtml = path.join('file://', this.eeCoreDir, 'resource', 'loading.html');
    loadingBrowserView.webContents.loadURL(loadingHtml);
    this.logger.info('loadingHtml:', loadingHtml);
    
    this.electron.mainWindow.webContents.on('dom-ready', async (event) => {
      self.electron.mainWindow.removeBrowserView(loadingBrowserView);
    });
  }

  /**
   * 加载主页面
   */
  loadMainUrl (url) {
    this.electron.mainWindow.loadURL(url);
  }

  /**
   * egg
   */
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

  /**
   * 限制一个窗口
   */
  async limitOneWindow () {
    const gotTheLock = app.requestSingleInstanceLock();
    if (!gotTheLock) {
      await this.appQuit();
    }
  }

  /**
   * electron app退出
   */  
  async appQuit () {
    await this.beforeClose();
    this.electron.mainWindow.destroy();
    app.quit();
  }

  /**
   * 预加载模块
   */
  async loderPreload () {
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
   * 序列化参数
   */ 
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
   * 捕获异常
   */
  catchLog () {
    const self = this;
    process.on('uncaughtException', function(err) {
      self.logger.error(err);
    });
  }

  /**
   * 主应用窗口已经创建
   */
  async windowReady () {
    // do some things

  }

  /**
   * app关闭之前
   */  
  async beforeClose () {
    // do some things

  }  
}

module.exports = EeApp;