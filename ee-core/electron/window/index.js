const { app, BrowserWindow, Menu } = require('electron');
const Conf = require('../../config');
const Ps = require('../../ps');
const EEMainWindow = Symbol('Ee#electron#mainWindow');

const Window = {

  /**
   * 获取 mainWindow
   */
  getMainWindow() {
    if (!this[EEMainWindow]) {
      this[EEMainWindow] = this.createMainWindow();
    }

    return this[EEMainWindow] || null;
  },

  /**
   * 创建应用主窗口
   */
  createMainWindow() {

    // todo
    // const protocolName = 'eefile';
    // protocol.registerFileProtocol(protocolName, (request, callback) => {
    //   const url = request.url.substring(protocolName.length + 3);
    //   console.log('[ee-core] [lib/eeApp] registerFileProtocol ----url: ', url);
    //   callback({ path: path.normalize(decodeURIComponent(url)) })
    // });

    const config = Conf.all();
    const win = new BrowserWindow(config.windowsOption);
    this[EEMainWindow] = win;

    // 菜单显示/隐藏
    if (config.openAppMenu === 'dev-show' && Ps.isProd()) {
      Menu.setApplicationMenu(null);
    } else if (config.openAppMenu === false) {
      Menu.setApplicationMenu(null);
    } else {
      // nothing 
    }

    // DevTools
    if (config.openDevTools) {
      win.webContents.openDevTools({
        mode: 'undocked'
      });
    }

    return win;
  },

  /**
   * 还原窗口
   */
  restoreMainWindow() {
    if (this[EEMainWindow]) {
      if (this[EEMainWindow].isMinimized()) {
        this[EEMainWindow].restore();
      }
      this[EEMainWindow].show();
      this[EEMainWindow].focus();
    }
  }
};

module.exports = Window;