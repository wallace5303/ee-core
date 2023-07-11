"use strict";

const os = require("os");
const path = require('path');
const fs = require('fs');
const { exec, execSync } = require('child_process');
const { createHash } = require('crypto');
const Ps = require('../ps');
const UtilsJson = require('./json');

// machine id
const { platform } = process;
const win32RegBinPath = {
  native: '%windir%\\System32',
  mixed: '%windir%\\sysnative\\cmd.exe /c %windir%\\System32'
};
const MachineGuid = {
  darwin: 'ioreg -rd1 -c IOPlatformExpertDevice',
  win32: `${win32RegBinPath[isWindowsProcessMixedOrNativeArchitecture()]}\\REG.exe ` +
      'QUERY HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Cryptography ' +
      '/v MachineGuid',
  linux: '( cat /var/lib/dbus/machine-id /etc/machine-id 2> /dev/null || hostname ) | head -n 1 || :',
  freebsd: 'kenv -q smbios.system.uuid || sysctl -n kern.hostuuid'
};

/**
 * 获取项目根目录package.json
 */
exports.getPackage = function() {
  const json = UtilsJson.readSync(path.join(Ps.getHomeDir(), 'package.json'));
  
  return json;
};

/**
 * Get the first proper MAC address
 * @param iface If provided, restrict MAC address fetching to this interface
 */
exports.getMAC = function(iface) {
  const zeroRegex = /(?:[0]{1,2}[:-]){5}[0]{1,2}/;
  const list = os.networkInterfaces();
  if (iface) {
      const parts = list[iface];
      if (!parts) {
          throw new Error(`interface ${iface} was not found`);
      }
      for (const part of parts) {
          if (zeroRegex.test(part.mac) === false) {
              return part.mac;
          }
      }
      throw new Error(`interface ${iface} had no valid mac addresses`);
  }
  else {
      for (const [key, parts] of Object.entries(list)) {
          // for some reason beyond me, this is needed to satisfy typescript
          // fix https://github.com/bevry/getmac/issues/100
          if (!parts)
              continue;
          for (const part of parts) {
              if (zeroRegex.test(part.mac) === false) {
                  return part.mac;
              }
          }
      }
  }
  throw new Error('failed to get the MAC address');
}

/**
 * Check if the input is a valid MAC address
 */
exports.isMAC = function(macAddress) {
  const macRegex = /(?:[a-z0-9]{1,2}[:-]){5}[a-z0-9]{1,2}/i;
  return macRegex.test(macAddress);
}

/**
 * is encrypt
 */
exports.isEncrypt = function(basePath) {
  const encryptDir = Ps.getEncryptDir(basePath);
  if (fs.existsSync(encryptDir)) {
    return true;
  }
  return false;
}

/**
 * get machine id
 */
exports.machineIdSync = function(original) {
  let id = expose(execSync(MachineGuid[platform]).toString());
  return original ? id : hash(id);
}

/**
 * get machine id (promise)
 * original <Boolean>, If true return original value of machine id, otherwise return hashed value (sha-256), default: false
 */
exports.machineId = function(original) {
  return new Promise((resolve, reject) => {
    return exec(MachineGuid[platform], {}, (err, stdout, stderr) => {
      if (err) {
        return reject(
            new Error(`Error while obtaining machine id: ${err.stack}`)
        );
      }
      let id = expose(stdout.toString());
      return resolve(original ? id : hash(id));
    });
  });
}

function isWindowsProcessMixedOrNativeArchitecture() {
  // detect if the node binary is the same arch as the Windows OS.
  // or if this is 32 bit node on 64 bit windows.
  if(process.platform !== 'win32') {
    return '';
  }
  if( process.arch === 'ia32' && process.env.hasOwnProperty('PROCESSOR_ARCHITEW6432') ) {
    return 'mixed';
  }
  return 'native';
}

function hash(guid) {
  return createHash('sha256').update(guid).digest('hex');
}

function expose(result) {
  switch (platform) {
    case 'darwin':
      return result
        .split('IOPlatformUUID')[1]
        .split('\n')[0].replace(/\=|\s+|\"/ig, '')
        .toLowerCase();
    case 'win32':
      return result
        .toString()
        .split('REG_SZ')[1]
        .replace(/\r+|\n+|\s+/ig, '')
        .toLowerCase();
    case 'linux':
      return result
        .toString()
        .replace(/\r+|\n+|\s+/ig, '')
        .toLowerCase();
    case 'freebsd':
      return result
        .toString()
        .replace(/\r+|\n+|\s+/ig, '')
        .toLowerCase();
    default:
      throw new Error(`Unsupported platform: ${process.platform}`);
  }
}



