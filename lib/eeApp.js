const path = require('path');
const getPort = require('get-port');
const {app, BrowserWindow, BrowserView, Menu} = require('electron');
const BaseApp = require('./baseApp');
const is = require('is-type-of');
const Koa = require('koa');
const koaServe = require('koa-static');

class EeApp extends BaseApp {
  constructor(options = {}) {
    super(options);

    this.electron = {
      mainWindow: null,
      tray: null
    };
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

    // 隐藏菜单
    if (!this.config.openAppMenu) {
      Menu.setApplicationMenu(null);
    }

    this.loadRemoreWeb();

    this.loadingView(winOptions);

    await this.windowReady();
  
    await this.loderPreload();

    this.loadLocalWeb();
    
    await this.startEggServer();

    // DevTools
    if (!app.isPackaged && this.config.openDevTools) {
      this.electron.mainWindow.webContents.openDevTools();
    }
  }

  /**
   * 加载远程网址
   */
  loadRemoreWeb () {
    const remoteConfig = this.config.remoteUrl;
    if (remoteConfig.enable) {
      this.loadMainUrl('remote_web', remoteConfig.url);
    }
  }

  /**
   * 加载本地前端资源
   */
  loadLocalWeb () {
    // 如果加载了远程，则不能加载本地的
    const remoteConfig = this.config.remoteUrl;
    if (remoteConfig.enable) {
      return;
    }

    // 如果egg服务开启，则不能加载本地的
    if (this.config.egg.enable == true) {
      return;
    }
    const self = this;
    const staticDir = path.join(this.config.homeDir, 'public', 'dist');

    const koaApp = new Koa();	
    koaApp.use(koaServe(staticDir))
    const port = process.env.EE_EGG_PORT;
    koaApp.listen(port, () => {
      const url = 'http://127.0.0.1:' + port;
      self.loadMainUrl('local_web', url);
    });
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
  async startEggServer () {
    // egg服务是否开启
    if (this.config.egg.enable == false) {
      return;
    }
    let eggConfig = this.config.egg;
    const protocol = 'http://';
    let startRes = null;
    let url = protocol + eggConfig.hostname + ':' + eggConfig.port;

    startRes = await this.startEgg(eggConfig).then((res) => res, (err) => err);
    this.coreLogger.info('[ee-core:EeApp] [startEggServer] startRes:', startRes)
    if (startRes === 'success') {
      // 如果加载远程网址，则不能重复load
      const remoteConfig = this.config.remoteUrl;
      if (remoteConfig.enable) {
        return;
      }
      this.loadMainUrl('egg', url);
    } else {
      // 失败后重启
      app.relaunch();
    }
  }

  /**
   * 加载loading页面
   */
  loadingView (winOptions) {
    const remoteConfig = this.config.remoteUrl;
    if (remoteConfig.enable) {
      return;
    }

    if (!this.config.loadingPage) {
      return;
    }

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
    const loadingHtml = path.join('file://', this.config.homeDir, 'public', 'html', 'loading.html');
    loadingBrowserView.webContents.loadURL(loadingHtml);
    this.logger.info('loadingHtml:', loadingHtml);
    
    this.electron.mainWindow.webContents.on('dom-ready', async (event) => {
      self.electron.mainWindow.removeBrowserView(loadingBrowserView);
    });
  }

  /**
   * 加载主页面
   */
  loadMainUrl (type, url) {

    // 环境模式 (远程模式，不加载dev)
    const remoteConfig = this.config.remoteUrl;
    if (this.config.env !== 'prod' && remoteConfig.enable == false) {
      const protocol = 'http://';
      const developmentModeConfig = this.config.developmentMode;
      const selectMode = developmentModeConfig.default;
      const modeInfo = developmentModeConfig.mode[selectMode];
      url = protocol + modeInfo.hostname + ':' + modeInfo.port;
      
      this.coreLogger.info('[ee-core:EeApp] frontend server :', url)
    }

    this.logger.info('main page is env: %s, type: %s, url: %s', this.config.env, type, url);
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
    this.coreLogger.info('[ee-core:EeApp] [startEgg] options', options);

    return this.startEggCluster(options);
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