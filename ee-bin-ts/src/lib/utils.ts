import chalk from 'chalk';
import is from 'is-type-of';
import { loadTsConfig } from 'config-file-ts';
import JsonLib from 'json5';
import mkdirp from 'mkdirp';
import * as fs from 'fs';
import * as path from 'path';
import OS from 'os';

const _basePath = process.cwd();

function checkConfig(prop: string): boolean {
  const filepath = path.join(_basePath, prop);
  return fs.existsSync(filepath);
}

function loadConfig(prop: string): any {
  const configFile = path.join(_basePath, prop);
  if (!fs.existsSync(configFile)) {
    const errorTips = `config file ${chalk.blue(`${configFile}`)} does not exist !`;
    throw new Error(errorTips);
  }

  let result: any;
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
  return result || {};
}

function loadEncryptConfig(): any {
  const configFile = './electron/config/encrypt.js';
  const filepath = path.join(_basePath, configFile);
  if (!fs.existsSync(filepath)) {
    const errorTips = `config file ${chalk.blue(`${filepath}`)} does not exist !`;
    throw new Error(errorTips);
  }
  const obj = require(filepath);
  if (!obj) return obj;

  let ret = obj;
  if (is.function(obj) && !is.class(obj)) {
    ret = obj();
  }

  return ret || {};
}

function getElectronProgram(): string {
  let electronPath: any;
  const electronModulePath = path.dirname(require.resolve('electron'));
  const pathFile = path.join(electronModulePath, 'path.txt');
  const executablePath = fs.readFileSync(pathFile, 'utf-8');
  if (executablePath) {
    electronPath = path.join(electronModulePath, 'dist', executablePath);
  } else {
    throw new Error('Check that electron is installed!');
  }
  return electronPath;
}

function compareVersion(v1: string, v2: string): number {
  const v1Arr: string[] = v1.split('.');
  const v2Arr: string[] = v2.split('.');
  const len = Math.max(v1Arr.length, v2Arr.length);

  while (v1Arr.length < len) {
    v1Arr.push('0');
  }
  while (v2Arr.length < len) {
    v2Arr.push('0');
  }

  for (let i = 0; i < len; i++) {
    const num1 = parseInt(v1Arr[i]);
    const num2 = parseInt(v2Arr[i]);

    if (num1 > num2) {
      return 1;
    } else if (num1 < num2) {
      return -1;
    }
  }

  return 0;
}

function isWindows(): boolean {
  return process.platform === 'win32';
}

function isOSX(): boolean {
  return process.platform === 'darwin';
}

function isMacOS(): boolean {
  return isOSX();
}

function isLinux(): boolean {
  return process.platform === 'linux';
}

function isx86(): boolean {
  return process.arch === 'ia32';
}

function isx64(): boolean {
  return process.arch === 'x64';
}

function rm(name: string): void {
  if (!fs.existsSync(name)) {
    return;
  }

  const nodeVersion = (process.versions && process.versions.node) || null;
  if (nodeVersion && compareVersion(nodeVersion, '14.14.0') === 1) {
    fs.rmSync(name, { recursive: true });
  } else {
    fs.rmdirSync(name, { recursive: true });
  }
}

function getPackage(): any {
  const homeDir = process.cwd();
  const content = readJsonSync(path.join(homeDir, 'package.json'));
  
  return content;
}

function readJsonSync(filepath: string): any {
  if (!fs.existsSync(filepath)) {
    throw new Error(`${filepath} is not found`);
  }
  return JSON.parse(fs.readFileSync(filepath, 'utf8'));
}

function writeJsonSync(filepath: string, str: any, options?: { replacer?: any; space?: number }) {
  options = options || {};
  if (!('space' in options)) {
    options.space = 2;
  }

  mkdirp.sync(path.dirname(filepath));
  if (typeof str === 'object') {
    str = JSON.stringify(str, options.replacer, options.space) + '\n';
  }

  fs.writeFileSync(filepath, str);
}

function getPlatform(delimiter: string = "_", isDiffArch: boolean = false): string {
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
    const core = isAppleSilicon ? "apple" : "intel";
    os = "macos" + delimiter + core;
  } else if (isLinux()) {
    os = "linux";
  }

  return os;
}

export {
  loadConfig,
  checkConfig,
  loadEncryptConfig,
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
};