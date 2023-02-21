const Base = require('./Base')
const fs = require('fs')

class FileSync extends Base {
  
  read() {
    if (fs.existsSync(this.source)) {
      // Read database
      try {
        const data = fs.readFileSync(this.source, {encoding: 'utf8'})

        // Handle blank file
        return data ? this.deserialize(data) : this.defaultValue
      } catch (e) {
        if (e instanceof SyntaxError) {
          e.message = `Malformed JSON in file: ${this.source}\n${e.message}`
        }
        throw e
      }
    } else {
      // Initialize
      fs.writeFileSync(this.source, this.serialize(this.defaultValue))
      return this.defaultValue
    }
  }

  write(data) {
    return fs.writeFileSync(this.source, this.serialize(data))
  }
}

module.exports = FileSync
