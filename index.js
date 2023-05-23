/**
 * @namespace EeCore
 */

/**
 * @member {app} EeCore#app
 * @since 1.0.0
 */
const EE = require('./ee');

/**
 * @member {Controller} EeCore#Controller
 * @since 1.0.0
 */
const Controller = require('./controller/baseContextClass');

/**
 * @member {Service} EeCore#Service
 * @since 1.0.0
 */
const Service = require('./service/baseContextClass');

/**
 * @member {Storage}
 * @since 1.0.0
 */
const Storage = require('./storage');

/**
 * @member {Utils}
 * @since 1.0.0
 */
const Utils = require('./old-utils');

/**
 * @member {Socket}
 * @since 1.0.0
 */
const Socket = require('./socket');

module.exports = {
  Application: EE.Application,
  Controller,
  Service,
  Storage,
  Socket,
  Utils
};