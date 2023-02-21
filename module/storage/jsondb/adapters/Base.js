class Base {
  constructor(source) {
    this.source = source
    this.defaultValue = {}
    this.serialize = this._stringify
    this.deserialize = JSON.parse
  }

  _stringify(obj) {
    return JSON.stringify(obj, null, 2)
  }
}

module.exports = Base
