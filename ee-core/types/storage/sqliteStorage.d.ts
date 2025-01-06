export class SqliteStorage {
    constructor(name: any, opt?: {});
    name: any;
    mode: string;
    dbDir: string;
    fileName: any;
    db: any;
    /**
     * 初始化db
     */
    _initDB(opt?: {}): any;
    /**
     * 获取文件名
     */
    _formatFileName(name: any): any;
    /**
     * 创建storage目录
     */
    _createDatabaseDir(): string;
    /**
     * 获取file path 模式
     */
    getMode(name: any): string;
    /**
     * 获取 db 文件目录
     */
    getDbDir(): string;
    /**
     * 获取文件绝对路径
     */
    getFilePath(): string;
}
