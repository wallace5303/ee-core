import os from "os";
import path from "path";
import fs from "fs";
import { exec, execSync } from "child_process";
import { createHash } from "crypto";
import * as Ps from "../ps/index.js";
import * as UtilsJson from "./json.js";
"use strict";
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
function isWindowsProcessMixedOrNativeArchitecture() {
    // detect if the node binary is the same arch as the Windows OS.
    // or if this is 32 bit node on 64 bit windows.
    if (process.platform !== 'win32') {
        return '';
    }
    if (process.arch === 'ia32' && process.env.hasOwnProperty('PROCESSOR_ARCHITEW6432')) {
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
export const getPackage = function () {
    const json = UtilsJson.readSync(path.join(Ps.getHomeDir(), 'package.json'));
    return json;
};
export const getMAC = function (iface) {
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
};
export const isMAC = function (macAddress) {
    const macRegex = /(?:[a-z0-9]{1,2}[:-]){5}[a-z0-9]{1,2}/i;
    return macRegex.test(macAddress);
};
export const isEncrypt = function (basePath) {
    const encryptDir = Ps.getEncryptDir(basePath);
    if (fs.existsSync(encryptDir)) {
        return true;
    }
    return false;
};
export const machineIdSync = function (original) {
    let id = expose(execSync(MachineGuid[platform]).toString());
    return original ? id : hash(id);
};
export const machineId = function (original) {
    return new Promise((resolve, reject) => {
        return exec(MachineGuid[platform], {}, (err, stdout, stderr) => {
            if (err) {
                return reject(new Error(`Error while obtaining machine id: ${err.stack}`));
            }
            let id = expose(stdout.toString());
            return resolve(original ? id : hash(id));
        });
    });
};
