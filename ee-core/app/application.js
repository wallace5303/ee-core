'use strict';

const debug = require('debug')('ee-core:app:appliaction');

const Instance = {
  app: null,
};


const Ready = "ready";
const ElectronAppReady = "electron-app-ready";
const WindowReady = "window-ready";
const BeforeClose = "before-close";

// const Staff = {
//   name: '',
//   handler: null,
//   args: []
// }

class Appliaction {
  constructor() {
    this.lifecycleEvents = {};
    this.eventsMap = {};
  }

  // add lifecycle event
  register(eventName, handler) {
    if (!this.lifecycleEvents[eventName]) {
      this.lifecycleEvents[eventName] = handler;
    }
  }

  // call lifecycle event
  callEvent(eventName, ...args) {
    const eventFn = this.lifecycleEvents[eventName];
    if (eventFn) {
      eventFn(...args);
    }
  } 

  // add listener
  on(eventName, handler) {
    if (!this.eventsMap[eventName]) {
      this.eventsMap[eventName] = handler;
    }
  }

  // emit listener
  emit(eventName, ...args) {
    const eventFn = this.eventsMap[eventName];
    if (eventFn) {
      eventFn(...args);
    }
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
  Ready,
  ElectronAppReady,
  WindowReady,
  BeforeClose
};