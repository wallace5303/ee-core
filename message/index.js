const ChildMessage = require('./childMessage');
const EEChildMessage = Symbol('EeCore#Module#ChildMessage');

const message = {

  /**
   * childMessage
   */
  get childMessage() {
    if (!this[EEChildMessage]) {
      this[EEChildMessage] = new ChildMessage();
    }

    return this[EEChildMessage] || null;
  },

};

module.exports = message;