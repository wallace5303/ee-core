export declare class SqliteStorage {
    constructor(name: any, opt?: {});
    name: any;
    mode: string;
    dbDir: string;
    fileName: any;
    db: any;
    _initDB(opt?: {}): any;
    _formatFileName(name: any): any;
    _createDatabaseDir(): string;
    getMode(name: any): string;
    getDbDir(): string;
    getFilePath(): string;
}
