'use strict'

const { ControllerLoader } = require('./controller_loader');
const { coreLogger } = require('../log');

const Instance = {
  controller: null,
};

function loadController() {
  // const controllerLoader = new ControllerLoader();
  // Instance["controller"] = controllerLoader.load();
}

module.exports = {
  loadController
};
