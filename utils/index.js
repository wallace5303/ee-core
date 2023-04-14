"use strict";

const os = require("os");
const path = require('path');
const fs = require('fs');
const Ps = require('../ps');
const UtilsJson = require('./json');

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


