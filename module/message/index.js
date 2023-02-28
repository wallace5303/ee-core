const Ps = require('../utils/ps');
const EEChildMessage = Symbol('EeCore#Module#ChildMessage');

const message = {

  /**
   * 
   */
  create () {

  },

  /**
   * childMessage
   */
  get childMessage() {
    if (!this[EEChildMessage]) {
      this[EEChildMessage] = Logger.create();
    }

    return this[EEChildMessage] || null;
  },

};



module.exports = message;