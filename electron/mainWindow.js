const Logger = require('./logger');
const EEMainWindow = Symbol('Ee#electron#mainWindow');

const Window = {
  /**
   * 创建日志实例
   */
  create (config) {
    const eeLog = Logger.create(config);

    return eeLog;
  },

  /**
   * 创建应用主窗口
   */
  async createWindow () {

    // todo
    // const protocolName = 'eefile';
    // protocol.registerFileProtocol(protocolName, (request, callback) => {
    //   const url = request.url.substring(protocolName.length + 3);
    //   console.log('[ee-core] [lib/eeApp] registerFileProtocol ----url: ', url);
    //   callback({ path: path.normalize(decodeURIComponent(url)) })
    // });

    const winOptions = this.config.windowsOption;
    this.electron.mainWindow = new BrowserWindow(winOptions);
    let win = this.electron.mainWindow;

    // 菜单显示/隐藏
    if (this.config.openAppMenu === 'dev-show'
      && this.config.env == 'prod') {
      Menu.setApplicationMenu(null);
    } else if (this.config.openAppMenu === false) {
      Menu.setApplicationMenu(null);
    } else {
      // nothing 
    }

    await this.windowReady();
  
    await this._loderAddons();

    await this._loderPreload();

    this.selectAppType();

    // DevTools
    if (!app.isPackaged && this.config.openDevTools) {
      win.webContents.openDevTools();
    }
  }


};

module.exports = Window;