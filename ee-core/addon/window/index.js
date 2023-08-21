const { BrowserWindow } = require('electron');

/**
 * 窗口插件
 * @class
 */
class WinAddon {

  constructor(app) {
    this.app = app;
    this.windowContentsIdMap = {};
  }

  /**
   * create window
   *
   * @function 
   * @since 1.0.0
   */
  create(name, opt) {

    // todo 判断name是否唯一
    // if (this.windowContentsIdMap.hasOwnProperty(name)) {
    //   throw new Error(`[addon] [window] Name: ${name} already exists!`);
    // }

    // [todo] 使用 extend, 避免多维对象被覆盖 
    const options = Object.assign({
      x: 10,
      y: 10,
      width: 980, 
      height: 650,
      webPreferences: {
        contextIsolation: false,
        nodeIntegration: true,
      },
    }, opt);
    const win = new BrowserWindow(options)
    
    const winContentsId = win.webContents.id;
    win.webContents.on('did-finish-load', () => {
      this.registerWCid(name, winContentsId);
    })
 
    win.webContents.on('destroyed', () => {
      this.removeWCid(name);
    })

    win.webContents.on('render-process-gone', (event, details) => {
      this.removeWCid(name);
    })

    return win;
  }

  /**
   * 获取窗口Contents id
   *
   * @function 
   * @since 1.0.0
   */
  getWCid(name) {
    const id = this.windowContentsIdMap[name] || null;
    return id;
  }

  /**
   * 获取主窗口Contents id
   *
   * @function 
   * @since 1.0.0
   */
  getMWCid() {
    const id = this.windowContentsIdMap['main'] || null;
    return id;
  }

  /**
   * 注册窗口Contents id
   *
   * @function 
   * @since 1.0.0
   */
  registerWCid(name, id) {
    this.windowContentsIdMap[name] = id;
  }

  /**
   * 销毁窗口Contents id
   *
   * @function 
   * @since 1.0.0
   */
   removeWCid(name) {
    delete this.windowContentsIdMap[name];
  }  
}

module.exports = WinAddon;