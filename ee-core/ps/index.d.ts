export declare function allEnv(): NodeJS.ProcessEnv;
export declare function env(): string;
export declare function isProd(): boolean;
export declare function isDev(): boolean;
export declare function isRenderer(): boolean;
export declare function isMain(): boolean;
export declare function isForkedChild(): boolean;
export declare function processType(): string;
export declare function appName(): string;
export declare function appVersion(): string;
export declare function getDataDir(): string;
export declare function getLogDir(): string;
export declare function getBundleDir(basePath: string): string;
export declare function getElectronCodeDir(basePath: string): string;
export declare function getFrontendCodeDir(basePath: string): string;
export declare function getRootDir(): string;
export declare function getBaseDir(): string;
export declare function getElectronDir(): string;
export declare function getPublicDir(): string;
export declare function getExtraResourcesDir(): string;
export declare function getAppUserDataDir(): string;
export declare function getExecDir(): string;
export declare function getUserHomeDir(): string;
export declare function getUserHomeAppDir(): string;
export declare function getUserHomeHiddenAppDir(): string;
export declare function getSocketPort(): number;
export declare function getHttpPort(): number;
export declare function isPackaged(): boolean;
export declare function isHotReload(): boolean;
export declare function exit(code?: number): never;
export declare function makeMessage(msg?: {}): {
    channel: string;
    event: string;
    data: {};
};
export declare function exitChildJob(code?: number): void;
export declare function isChildJob(): boolean;
export declare function isChildPoolJob(): boolean;
export declare function getArgumentByName(name: string): string;
