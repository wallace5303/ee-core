const path = require('path');

/**
 * Html
 */
const Html = {
  getFilepath(name){
    const pagePath = path.join(__dirname, name);
    return pagePath;
  },

}

module.exports = Html;