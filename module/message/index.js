const { isDev, isRenderer, isMain } = require('../utils/ps');

const m = {};

if (isMain) {
  m.d = require();
}

if (isRenderer) {
  m.d = require();
}

module.exports = m;