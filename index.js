/**
 * @namespace EeCore
 */

/**
 * @member {Appliaction} EeCore#Appliaction
 * @since 1.0.0
 */
const Appliaction = require('./module/app/application');

/**
 * @member {Controller} EeCore#Controller
 * @since 1.0.0
 */
const Controller = require('./module/core/lib/utils/base_context_class');

/**
 * @member {Service} EeCore#Service
 * @since 1.0.0
 */
const Service = require('./module/core/lib/utils/base_context_class');

/**
 * @member {Storage}
 * @since 1.0.0
 */
const Storage = require('./module/storage/index');

/**
 * @member {Utils}
 * @since 1.0.0
 */
const Utils = require('./module/oldUtils/index');

/**
 * @member {Socket}
 * @since 1.0.0
 */
const Socket = require('./module/socket/io');

module.exports = {
  Appliaction,
  Controller,
  Service,
  Storage,
  Socket,
  Utils
};