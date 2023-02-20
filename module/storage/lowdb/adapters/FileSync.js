const fs = require('graceful-fs')
const Base = require('./Base')
const fileSystem = require('fs')

//const readFile = fs.readFileSync
const writeFile = fs.writeFileSync

// Same code as in FileAsync, minus `await`
class FileSync extends Base {
  read() {
    // fs.exists is deprecated but not fs.existsSync
    if (fs.existsSync(this.source)) {
      // Read database
      try {
        // 使用 fileSystem的readFileSync
        //const data = readFile(this.source, 'utf-8').trim()
        const data = fileSystem.readFileSync(this.source, {encoding: 'utf-8'})

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
      writeFile(this.source, this.serialize(this.defaultValue))
      return this.defaultValue
    }
  }

  write(data) {
    return writeFile(this.source, this.serialize(data))
  }
}

module.exports = FileSync
