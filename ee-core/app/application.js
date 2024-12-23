'use strict';

const debug = require('debug')('ee-core:app:appliaction');
const path = require('path');
const { getPort } = require('../utils/port');
const { getConfig } = require('../config');
const { startAll } = require("../socket");

const Instance = {
  app: null,
};

const Events = [
  "ready",
  "electronAppReady",
  "quit",
  "windowReady",
  "beforeClose"
];

const Staff = {
  name: '',
  handler: null,
  args: []
}

class Appliaction {
  constructor() {
    this.eventMap = {};
  }

  register(eventName, handler) {
    if (!this.eventMap[eventName]) {
      this.eventMap[eventName] = handler;
    }

  }

  callEvent(eventName, ...args) {
    const eventFn = this.eventMap[eventName];
    if (eventFn) {
      eventFn(...args);
    }
  }

  /**
   * load socket server
   */
  loadSocket() {
    startAll();
  }  

}

async function loadApp() {
  const app = new Appliaction();
  app.loadSocket();

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