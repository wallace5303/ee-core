const { BrowserWindow } = require('electron');

const windowIdMap = {}

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
    const win = new BrowserWindow(options)
    
    win.webContents.on('did-finish-load', () => {
      registerWindowId(name, win.webContents.id);
      console.log('did-finish-load:', windowIdMap)
    })
 
    win.webContents.on('destroyed', () => {
      removeWindowId(name);
      console.log('destroyed:', windowIdMap)
    })

    win.webContents.on('render-process-gone', (event, details) => {
      removeWindowId(name);
      console.log('render-process-gone:', windowIdMap)
    })

    return win;
  }

  return f;
}

/**
 * 注册窗口id
 */
function registerWindowId (k, v) {
  windowIdMap[k] = v;
  console.log('registerWindowId', windowIdMap);
}


/**
 * 销毁窗口id
 */
function removeWindowId (k) {
  delete windowIdMap[k];
  console.log('removeWindowId', windowIdMap);
}