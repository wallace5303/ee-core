/**
 * @namespace EeCore
 */

/**
 * @member {app} EeCore#app
 * @since 1.0.0
 */
const app = require('./app');

/**
 * @member {Controller} EeCore#Controller
 * @since 1.0.0
 */
const Controller = require('./controller');

/**
 * @member {Service} EeCore#Service
 * @since 1.0.0
 */
const Service = require('./service');

/**
 * @member {Storage}
 * @since 1.0.0
 */
const Storage = require('./storage');

/**
 * @member {Utils}
 * @since 1.0.0
 */
const Utils = require('./oldUtils');

/**
 * @member {Socket}
 * @since 1.0.0
 */
const Socket = require('./socket/io');

module.exports = {
  Appliaction: app.Appliaction,
  Controller,
  Service,
  Storage,
  Socket,
  Utils
};