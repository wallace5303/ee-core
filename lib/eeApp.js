const {app, BrowserWindow, BrowserView, Menu} = require('electron')
const path = require('path')
// const eggLauncher = require('ee-core/lib/lanucher')
const BaseModule = require('./baseModule')
// const electronConfig = require('ee-core/lib/config')
// const storage = require('ee-core/lib/storage')
// const preferences = require('ee-core/lib/preferences')
// const helper = require('ee-core/lib/helper')

class EeApp extends BaseModule {
  constructor(options = {}) {

    super(options);

  }
}

module.exports = EeApp;