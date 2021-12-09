'use strict';

/**
 * @namespace EeCore
 */

/**
 * @member {Main} EeCore#Main
 * @since 1.0.0
 */
 exports.Main = require('./lib/main');

/**
 * @member {Api} EeCore#Api
 * @since 1.0.0
 */
exports.Api = require('./lib/api');

/**
 * @member {AutoLaunch} EeCore#AutoLaunch
 * @since 1.0.0
 */
exports.AutoLaunch = require('./lib/autoLaunch');

/**
 * @member {AutoUpdater} EeCore#AutoUpdater
 * @since 1.0.0
 */
exports.AutoUpdater = require('./lib/autoUpdater');

/**
 * @member {Awaken} EeCore#Awaken
 * @since 1.0.0
 */
exports.Awaken = require('./lib/awaken');

/**
 * @member {ChromeExtension} EeCore#ChromeExtension
 * @since 1.0.0
 */
exports.ChromeExtension = require('./lib/chromeExtension');

/**
 * @member {CrashReport} EeCore#CrashReport
 * @since 1.1.0
 */
exports.CrashReport = require('./lib/crashReport');

/**
 * @member {ELogger} EeCore#ELogger
 * @since 1.10.0
 */
exports.ELogger = require('./lib/eLogger');

/**
 * @member {Helper} EeCore#Helper
 * @since 1.2.0
 */
exports.Helper = require('./lib/helper');

/**
 * @member {IpcMain} EeCore#IpcMain
 */
exports.IpcMain = require('./lib/ipcMain');

/**
 * @member {Lanucher} EeCore#Lanucher
 */
 exports.Lanucher = require('./lib/lanucher');

 /**
 * @member {Security} EeCore#Security
 */
  exports.Security = require('./lib/security');

  /**
 * @member {Shortcut} EeCore#Shortcut
 */
 exports.Shortcut = require('./lib/shortcut');

 /**
 * @member {Storage} EeCore#Storage
 */
  exports.Storage = require('./lib/storage');

  /**
 * @member {Tray} EeCore#Tray
 */
 exports.Tray = require('./lib/tray');
