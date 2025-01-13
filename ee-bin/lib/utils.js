'use strict';

const debug = require('debug')('ee-bin:lib:utils');
const path = require('path');
const fs = require('fs');
const chalk = require('chalk');
const is = require('is-type-of');
const { loadTsConfig } = require('config-file-ts');
const JsonLib = require('json5');
const mkdirp = require('mkdirp');
const OS = require('os');
const defaultConfig = require('../config/bin_default');
const { extend } = require('./extend');

const _basePath = process.cwd();
const userBin = './cmd/bin.js';

function loadConfig(binFile) {
  const binPath = binFile ? binFile : userBin;
  const userConfig = loadFile(binPath);
  const result = extend(true, defaultConfig, userConfig);
  debug('[loadConfig] bin:%j', result)

  return result
};

function loadFile(filepath) {
  const configFile = path.join(_basePath, filepath);
  if (!fs.existsSync(configFile)) {
    const errorTips = 'file ' + chalk.blue(`${configFile}`) + ' does not exist !';
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

function isWindows() {
  return process.platform === 'win32'
}

function isOSX() {
  return process.platform === 'darwin'
}

function isMacOS() {
  return isOSX()
}

function isLinux() {
  return process.platform === 'linux'
}

function isx86() {
  return process.arch === 'ia32'
}

function isx64() {
  return process.arch === 'x64'
}

/**
 * Delete a file or folder
 */
function rm(name) {
  // check
  if (!fs.existsSync(name)) {
    return
  }

  const nodeVersion = (process.versions && process.versions.node) || null;
  if (nodeVersion && compareVersion(nodeVersion, '14.14.0') == 1) {
    fs.rmSync(name, {recursive: true});
  } else {
    fs.rmdirSync(name, {recursive: true});
  }
}

/**
 * 获取项目根目录package.json
 */
function getPackage () {
  const content = readJsonSync(path.join(_basePath, 'package.json'));
  return content;
}

function readJsonSync (filepath) {
  if (!fs.existsSync(filepath)) {
    throw new Error(filepath + ' is not found');
  }
  return JSON.parse(fs.readFileSync(filepath));
}

function writeJsonSync (filepath, str, options) {
  options = options || {};
  if (!('space' in options)) {
    options.space = 2;
  }

  mkdirp.sync(path.dirname(filepath));
  if (typeof str === 'object') {
    str = JSON.stringify(str, options.replacer, options.space) + '\n';
  }

  fs.writeFileSync(filepath, str);
};

function getPlatform(delimiter = "_", isDiffArch = false) {
  let os = "";
  if (isWindows()) {
    os = "windows";
    if (isDiffArch) {
      const arch = isx64() ? "64" : "32";
      os += delimiter + arch;
    }
  } else if (isMacOS()) {
    let isAppleSilicon = false;
    const cpus = OS.cpus();
    for (let cpu of cpus) {
      if (cpu.model.includes('Apple')) {
        isAppleSilicon = true;
        break;
      }
    }
    const core = isAppleSilicon? "apple" : "intel";
    os = "macos" + delimiter + core;
  } else if (isLinux()) {
    os = "linux";
  }

  return os;
}

module.exports = {
  loadConfig,
  getElectronProgram,
  compareVersion,
  isWindows,
  isOSX,
  isMacOS,
  isLinux,
  isx86,
  isx64,
  getPlatform,
  rm,
  getPackage,
  readJsonSync,
  writeJsonSync
}
