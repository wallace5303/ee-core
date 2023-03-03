/**
 * @namespace EeCore
 */
let app;

/**
 * @member {Controller} EeCore#Controller
 * @since 1.0.0
 */
const Controller = require('./module/controller');

/**
 * @member {Service} EeCore#Service
 * @since 1.0.0
 */
const Service = require('./module/service');

/**
 * @member {Storage}
 * @since 1.0.0
 */
const Storage = require('./module/storage');

/**
 * @member {Utils}
 * @since 1.0.0
 */
const Utils = require('./module/oldUtils');

/**
 * @member {Socket}
 * @since 1.0.0
 */
const Socket = require('./module/socket/io');

module.exports = {
  get Appliaction () {
    if (app) {
      return app;
    }
    app = require('./module/app/application');
    return app;
  },
  Controller,
  Service,
  Storage,
  Socket,
  Utils
};