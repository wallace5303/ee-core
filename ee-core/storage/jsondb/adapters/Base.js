class Base {
  constructor(source) {
    this.source = source
    this.defaultValue = {}
    this.serialize = this._stringify
    this.deserialize = JSON.parse
  }

  _canDeserialized(obj) {
    try {
      this.deserialize(obj)
      return true
    } catch (e) {
      return false
    }
  }

  _stringify(obj) {
    return JSON.stringify(obj, null, 2)
  }
}

module.exports = Base
