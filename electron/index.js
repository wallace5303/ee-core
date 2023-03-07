const Window = require('./window');
const EEMainWindow = Symbol('Ee#electron#mainWindow');

const Electron = {

  /**
   * 获取 mainWindow
   */
  getMainWindow() {
    if (!this[EEMainWindow]) {
      this[EEMainWindow] = Window.createWindow();
    }

    return this[EEMainWindow] || null;
  },

  /**
   * 兼容1.x版本api
   */
  get mainWindow() {
    return this.getMainWindow();
  },

  /**
   * extra
   */
  extra: {
    closeWindow: false,
  },  
};

module.exports = Electron;