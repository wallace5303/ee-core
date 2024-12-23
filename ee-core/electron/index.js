'use strict';

const { createElectron } = require("./app");

// load socket server
function loadElectron() {
  createElectron();
}

module.exports = {
  loadElectron,
};