const Base = require('./Base')
const fs = require('fs')
const Log = require('../../../log')

class FileSync extends Base {

  constructor(options = {}) {
    const { source,  isSysDB } = options;
    super(source);
    this.isSysDB = isSysDB;
  }
  
  read() {
    if (fs.existsSync(this.source)) {
      // Read database
      let data = fs.readFileSync(this.source, {encoding: 'utf8'}).trim();

      // 是否可以正常解析
      let canDeserialized = this._canDeserialized(data);
      if (!canDeserialized) {
        let errMessage = `[ee-core] [storage/jsondb] malformed json in file: ${this.source}\n${data}`;
        Log.coreLogger.error(errMessage);

        // 是否文件结尾多一个括号，尝试处理
        data = data.trim().slice(0, -1);
        canDeserialized = this._canDeserialized(data);
        if (canDeserialized) {
          // 转换为对象，并写入
          const newData = JSON.parse(data);
          this._fsWrite(newData);
        } else {
          //  [todo] 重置 system.json ，不处理用户数据
          if (this.isSysDB) {
            this._fsWrite(this.defaultValue);
          }
          errMessage = '[ee-core] [storage/jsondb] malformed json that cannot be handled!';
          Log.coreLogger.error(errMessage);
        }
      }
      const value = canDeserialized ? this.deserialize(data) : this.defaultValue;
      return value;
    } else {
      // Initialize
      this._fsWrite(this.defaultValue);
      return this.defaultValue
    }
  }

  write(data) {
    return this._fsWrite(data);
  }

  _fsWrite(data) {
    const isObject = Object.prototype.toString.call(data) === '[object Object]';
    if (!isObject) {
      Log.coreLogger.error('[ee-core] [storage/jsondb] Variable is not an object :', data);
      return
    }

    return fs.writeFileSync(this.source, this.serialize(data), {flag:'w+'})
  }
}

module.exports = FileSync
