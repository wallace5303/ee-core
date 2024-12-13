'use strict';

const { ConfigLoader } = require('./config_loader');

const Cache = {
  config: null,
};

function loadConfig() {
  const configLoader = new ConfigLoader();
  Cache["config"] = configLoader.load();
  return Cache["config"];
}

function getConfig() {
  if (!Cache["config"]) {
    Cache["config"] = loadConfig();
  };
  return Cache["config"];
}

module.exports = {
  loadConfig,
  getConfig,
};