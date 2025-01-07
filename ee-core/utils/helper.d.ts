/**
 * fnDebounce
 *
 * @param  {Function} fn - 回调函数
 * @param  {Time} delayTime - 延迟时间(ms)
 * @param  {Boolean} isImediate - 是否需要立即调用
 * @param  {type} args - 回调函数传入参数
*/
export function fnDebounce(): (fn: any, delayTime: any, isImediate: any, args: any) => any;
export function getRandomString(): string;
export function mkdir(filepath: any, opt?: {}): void;
export function chmodPath(path: any, mode: any): void;
export function compareVersion(v1: any, v2: any): 0 | 1 | -1;
export function middleware(fn: any): any;
export function stringify(obj: any, ignore?: any[]): string;
/**
 * 是否有效值
 */
export function validValue(value: any): boolean;
export function checkConfig(prop: any): boolean;
export function loadConfig(prop: any): any;
export function sleep(ms: any): Promise<any>;
export function replaceArgsValue(argv: any, key: any, value: any): any;
export function getValueFromArgv(argv: any, key: any): any;
export function fileIsExist(filepath: any): boolean;
