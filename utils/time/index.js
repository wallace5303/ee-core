'use strict';

const util = require('util');
const ms = require('./ms');

function humanizeToMs (t) {
  if (typeof t === 'number') return t;
  var r = ms(t);
  if (r === undefined) {
    var err = new Error(util.format('humanize-ms(%j) result undefined', t));
    console.warn(err.stack);
  }
  return r;
}

const TIME = {
  humanizeToMs,
  ms
}
module.exports = TIME;