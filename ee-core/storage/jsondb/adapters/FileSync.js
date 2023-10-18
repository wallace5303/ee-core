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
      const data = fs.readFileSync(this.source, {encoding: 'utf8'}).trim();
      
      const canDeserialized = this._canDeserialized(data);
      if (!canDeserialized) {
        const errMessage = `Malformed JSON in file: ${this.source}\n${data}`;
        console.error(errMessage)

        //  reset system.json
        if (this.isSysDB) {
          this._fsWrite(this.defaultValue);
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
