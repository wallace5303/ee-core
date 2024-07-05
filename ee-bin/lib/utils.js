'use strict';

const path = require('path');
const fs = require('fs');
const chalk = require('chalk');
const is = require('is-type-of');
const { loadTsConfig } = require('config-file-ts');
const JsonLib = require('json5');

const _basePath = process.cwd();

function checkConfig(prop) {
  const filepath = path.join(_basePath, prop);
  if (fs.existsSync(filepath)) {
    return true;
  }

  return false;
}

function loadConfig(prop) {
  const configFile = path.join(_basePath, prop);
  if (!fs.existsSync(configFile)) {
    const errorTips = 'config file ' + chalk.blue(`${configFile}`) + ' does not exist !';
    throw new Error(errorTips)
  }

  let result;
  if (configFile.endsWith(".json5") || configFile.endsWith(".json")) {
    const data = fs.readFileSync(configFile, 'utf8');
    return JsonLib.parse(data);
  }
  if (configFile.endsWith(".js") || configFile.endsWith(".cjs")) {
    result = require(configFile);
    if (result.default != null) {
      result = result.default;
    }
  } else if (configFile.endsWith(".ts")) {
    result = loadTsConfig(configFile);
  }
  if (is.function(result) && !is.class(result)) {
    result = result();
  }
  return result || {}
};

function loadEncryptConfig() {
  const configFile = './electron/config/encrypt.js';
  const filepath = path.join(_basePath, configFile);
  if (!fs.existsSync(filepath)) {
    const errorTips = 'config file ' + chalk.blue(`${filepath}`) + ' does not exist !';
    throw new Error(errorTips)
  }
  const obj = require(filepath);
  if (!obj) return obj;

  let ret = obj;
  if (is.function(obj) && !is.class(obj)) {
    ret = obj();
  }

  return ret || {};
};

/**
 * get electron program
 */
function getElectronProgram() {
  let electronPath
  const electronModulePath = path.dirname(require.resolve('electron'))
  const pathFile = path.join(electronModulePath, 'path.txt')
  const executablePath = fs.readFileSync(pathFile, 'utf-8')
  if (executablePath) {
    electronPath = path.join(electronModulePath, 'dist', executablePath)
  } else {
    throw new Error('Check that electron is installed!')
  }
  return electronPath;
};

/**
 * 版本号比较
 */
function compareVersion(v1, v2) {
  v1 = v1.split('.')
  v2 = v2.split('.')
  const len = Math.max(v1.length, v2.length)

  while (v1.length < len) {
    v1.push('0')
  }
  while (v2.length < len) {
    v2.push('0')
  }

  for (let i = 0; i < len; i++) {
    const num1 = parseInt(v1[i])
    const num2 = parseInt(v2[i])

    if (num1 > num2) {
      return 1
    } else if (num1 < num2) {
      return -1
    }
  }

  return 0
}

function isWindows(prop) {
  return process.platform === 'win32'
}

module.exports = {
  loadConfig,
  checkConfig,
  loadEncryptConfig,
  getElectronProgram,
  compareVersion,
  isWindows
}
