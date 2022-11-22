const { BrowserWindow } = require('electron');

const windowContentsIdMap = {}

/**
 * 窗口模块
 */
module.exports = (app) => {

  const f = {}

  /**
   * create window
   *
   * @function 
   * @since 1.0.0
   */
  f.create = (name, opt) => {
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
    console.log('options:', options);
    const win = new BrowserWindow(options)
    
    const winContentsId = win.webContents.id;
    win.webContents.on('did-finish-load', () => {
      f.registerWCid(name, winContentsId);
    })
 
    win.webContents.on('destroyed', () => {
      f.removeWCid(name);
    })

    win.webContents.on('render-process-gone', (event, details) => {
      f.removeWCid(name);
      console.log('render-process-gone:', windowContentsIdMap)
    })

    return win;
  }

  /**
   * 获取窗口Contents id
   *
   * @function 
   * @since 1.0.0
   */
  f.getWCid = (name) => {
    const id = windowContentsIdMap[name] || null;
    return id;
  }

  /**
   * 获取主窗口Contents id
   *
   * @function 
   * @since 1.0.0
   */
  f.getMWCid = () => {
    const id = windowContentsIdMap['main'] || null;
    return id;
  }

  /**
   * 注册窗口Contents id
   *
   * @function 
   * @since 1.0.0
   */
  f.registerWCid = (name, id) => {
    windowContentsIdMap[name] = id;
  }

  /**
   * 销毁窗口Contents id
   *
   * @function 
   * @since 1.0.0
   */
   f.removeWCid = (name) => {
    delete windowContentsIdMap[name];
  }

  return f;
}