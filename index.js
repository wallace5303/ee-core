'use strict';

/**
 * @namespace EeCore
 */

/**
 * @member {Appliaction} EeCore#Appliaction
 * @since 1.0.0
 */
const Appliaction = require('./lib/application');

/**
 * @member {Controller} EeCore#Controller
 * @since 1.0.0
 */
const Controller = require('./core/lib/utils/base_context_class');

/**
 * @member {Service} EeCore#Service
 * @since 1.0.0
 */
const Service = require('./core/lib/utils/base_context_class');

/**
 * @member {Storage}
 * @since 1.0.0
 */
const Storage = require('./lib/storage/index');

/**
 * @member {Utils}
 * @since 1.0.0
 */
const Utils = require('./utils/index');

/**
 * @member {Socket}
 * @since 1.0.0
 */
const Socket = require('./lib/socket/io');

module.exports = {
  Appliaction,
  Controller,
  Service,
  Storage,
  Socket,
  Utils
};