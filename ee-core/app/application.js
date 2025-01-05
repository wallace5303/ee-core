'use strict';

const debug = require('debug')('ee-core:app:appliaction');

const Instance = {
  app: null,
};

class Appliaction {
  constructor() {

  }

}

function loadApp() {
  const app = new Appliaction();
  Instance.app = app;
  return app;
}

function getApp() {
  return Instance.app;
}

module.exports = {
  Appliaction,
  loadApp,
  getApp,
};