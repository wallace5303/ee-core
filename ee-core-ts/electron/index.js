const Window = require('./window');

const Electron = {

  /**
   * 兼容1.x版本api
   */
  get mainWindow() {
    return Window.getMainWindow();
  },

  /**
   * extra
   */
  extra: {
    closeWindow: false,
  }, 
};

module.exports = Electron;