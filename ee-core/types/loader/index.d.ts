/**
 * 加载单个文件(如果是函数，将被执行)
 *
 * @param {String} filepath - fullpath
 * @param {Array} inject - pass rest arguments into the function when invoke
 * @return {Object} exports
 */
export function loadFile(filepath: string, ...inject: any[]): any;
/**
 * 加载并运行文件
 *
 * @param {String} filepath - fullpath
 * @param {Array} inject - pass rest arguments into the function when invoke
 * @return {Any}
 */
export function execFile(filepath: string, ...inject: any[]): Any;
export function requireFile(filepath: any): any;
/**
 * 模块的绝对路径
 * @param {String} filepath - fullpath
 */
export function resolveModule(filepath: string): string;
/**
 * 获取electron目录下文件的绝对路径
 * @param {String} filepath - fullpath
 */
export function getFullpath(filepath: string): string;
