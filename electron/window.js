const {app, BrowserWindow, Menu} = require('electron');
const Conf = require('../config');
const Ps = require('../ps');

const Window = {

  /**
   * 创建应用主窗口
   */
  createWindow () {

    // todo
    // const protocolName = 'eefile';
    // protocol.registerFileProtocol(protocolName, (request, callback) => {
    //   const url = request.url.substring(protocolName.length + 3);
    //   console.log('[ee-core] [lib/eeApp] registerFileProtocol ----url: ', url);
    //   callback({ path: path.normalize(decodeURIComponent(url)) })
    // });

    const config = Conf.all();
    let win = new BrowserWindow(config.windowsOption);

    // 菜单显示/隐藏
    if (config.openAppMenu === 'dev-show' && Ps.isProd()) {
      Menu.setApplicationMenu(null);
    } else if (config.openAppMenu === false) {
      Menu.setApplicationMenu(null);
    } else {
      // nothing 
    }

    // DevTools
    if (!app.isPackaged && config.openDevTools) {
      win.webContents.openDevTools({
        mode: 'undocked'
      });
    }

    return win;
  }


};

module.exports = Window;