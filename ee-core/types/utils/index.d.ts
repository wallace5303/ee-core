/**
 * 获取项目根目录package.json
 */
export function getPackage(): any;
/**
 * Get the first proper MAC address
 * @param iface If provided, restrict MAC address fetching to this interface
 */
export function getMAC(iface: any): string;
/**
 * Check if the input is a valid MAC address
 */
export function isMAC(macAddress: any): boolean;
export function isFileProtocol(protocol: any): boolean;
export function isWebProtocol(protocol: any): boolean;
export function isJsProject(baseDir: any): boolean;
/**
 * get machine id
 */
export function machineIdSync(original: any): any;
/**
 * get machine id (promise)
 * original <Boolean>, If true return original value of machine id, otherwise return hashed value (sha-256), default: false
 */
export function machineId(original: any): Promise<any>;
import is = require("./is");
export { is };
