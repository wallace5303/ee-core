//require('bytenode');
const { BrowserWindow } = require('electron');
const fs = require('fs');
const loadView = require('./loadView');
// const MessageChannel = require('./MessageChannel.class');

class RendererJob {

  /**
    * constructor
    * @param  {String} name - job name
    * @param  {String} path - path to file
    * @param  {Object} options - options to create BrowserWindow
    */
  constructor(name, path, opt = {}) {
    let options = Object.assign({
      show: false,
      webPreferences: {
        webSecurity: true,
        nodeIntegration: true,
        contextIsolation: false,
        //enableRemoteModule: true
      }
    }, opt);

    this.subWin = new BrowserWindow(options);

    this.jobReady = false;
    this.exec = path;
    this.name = name;
    this.listeners = [];
    this.callbacks = [];
    this.fails = [];
    this.id = this.subWin.id;
    this.webSecurity = options.webPreferences.webSecurity;

    // this.callbacks.push(() => {
    //   MessageChannel.registry(name, this.id, this.subWin.webContents.getOSProcessId());
    // });

    // job state listener
    this.subWin.webContents.on('did-finish-load', this._didFinishLoad);
    this.subWin.webContents.on('did-fail-load', this._didFailLoad);

    // load job
    this._loadJob(this.exec);
  }

  /**
   * 显示开发者工具栏
   */
  openDevTools() {
    this.subWin.webContents.openDevTools({
      mode: 'undocked'
    });
  }

  /**
   * 窗口加载完成，即业务代码执行完毕
   */
  _didFinishLoad = () => {
    this.jobReady = true;
    this.callbacks.forEach(callback => {
      callback(this.id);
    });
  }

  /**
   * 窗口加载失败，即业务运行失败
   */
  _didFailLoad = (error) => {
    this.jobReady = false;
    this.fails.forEach(handle => {
      handle(error.toString());
    });
  }


  /**
   * 加载任务
   */
  _loadJob(path) {
    if (!this.webSecurity) {
      this._loadURLUnsafe(path);
    } else {
      this._loadURLSafe(path);
    }
  }

  /**
   * 安全的脚本注入
   */
  _loadURLSafe(path) {
    return new Promise((resolve, reject) => {
      fs.readFile(path, { encoding: 'utf-8' }, (err, buffer) => {
        if (err) {
          reject(err);
          this._didFailLoad(err);
          return console.error(err);
        }

        let param = {
          webSecurity: true,
          script: buffer.toString(),
          title: `${this.name} job`,
          base: path
        }
        const viewData = loadView(param);

        this.subWin.loadURL(viewData)
        .then(resolve)
        .catch(err => {
          reject(err);
          this._didFailLoad(err);
          console.error(err);
        });
      })
    })
  }

  /**
   * 不安全的脚本注入
   */
  _loadURLUnsafe(path) {
    let param = {
      webSecurity: false,
      src: this.exec,
      title: `${this.name} job`,
      base: path
    }
    const viewData = loadView(param);

    this.subWin.loadURL(viewData)
    .catch(err => {
      this._didFailLoad(err);
      console.error(err);
    });
  }
}

module.exports = RendererJob;
