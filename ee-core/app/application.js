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
   * generate ports
   */
  async createPorts() {
    const Conf = getConfig();
    if (Conf.socketServer.enable) {
      const socketPort = await getPort({port: parseInt(Conf.socketServer.port)});
      process.env.EE_SOCKET_PORT = socketPort;
      Conf.socketServer.port = socketPort;
    }
    
    if (Conf.httpServer.enable) {
      const httpPort = await getPort({port: parseInt(Conf.httpServer.port)});
      process.env.EE_HTTP_PORT = httpPort;
      Conf.httpServer.port = httpPort;
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

  await app.createPorts();
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