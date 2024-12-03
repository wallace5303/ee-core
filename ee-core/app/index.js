'use strict';

const debug = require('debug')('ee-core:EECore');
const { Appliaction } = require('./application');

class EECore {
  constructor() {
    this.app = undefined;
  } 

  init() {
    debug('init application')
    this.app = new Appliaction();
  }
};
const eeCore = new EECore();

module.exports = {
  EECore,
  eeCore
};