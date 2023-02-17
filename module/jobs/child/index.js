//require('bytenode');
const fs = require('fs');

class ChildJob {

  /**
    * constructor
    * @param  {String} name - job name
    * @param  {String} path - path to file
    * @param  {Object} options - options 
    */
  constructor(name, path, opt = {}) {
    let options = Object.assign({
      show: false,
    }, opt);

    this.childProcess = new BrowserWindow(options);

    this.jobReady = false;
    this.exec = path;
    this.name = name;


    // load job
    this._loadJob(this.exec);
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


}

module.exports = ChildJob;
