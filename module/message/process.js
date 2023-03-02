const Ps = require('../ps');

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