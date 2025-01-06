export function allEnv(): NodeJS.ProcessEnv;
export function env(): string;
export function isProd(): boolean;
/**
 * 是否为开发环境
 */
export function isDev(): boolean;
export function isRenderer(): boolean;
export function isMain(): boolean;
export function isForkedChild(): boolean;
export function processType(): string;
export function appName(): string;
export function appVersion(): string;
export function getDataDir(): string;
export function getLogDir(): string;
export function getBundleDir(basePath: any): string;
export function getRootDir(): string;
export function getBaseDir(): string;
export function getElectronDir(): string;
export function getPublicDir(): string;
export function getExtraResourcesDir(): string;
export function getAppUserDataDir(): string;
export function getExecDir(): string;
export function getUserHomeDir(): string;
export function getUserHomeAppDir(): string;
export function getUserHomeHiddenAppDir(): string;
export function getSocketPort(): number;
export function getHttpPort(): number;
/**
 * 是否打包
 */
export function isPackaged(): boolean;
export function isHotReload(): boolean;
export function exit(code?: number): never;
export function makeMessage(msg?: {}): {
    channel: string;
    event: string;
    data: {};
};
export function exitChildJob(code?: number): void;
export function isChildJob(): boolean;
export function isChildPoolJob(): boolean;
export function getArgumentByName(name: any): string;
