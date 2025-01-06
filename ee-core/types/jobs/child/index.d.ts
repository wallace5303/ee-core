export class ChildJob extends EventEmitter<[never]> {
    constructor();
    jobs: {};
    config: any;
    /**
     * 初始化监听
     */
    _initEvents(): void;
    /**
     * 执行一个job文件
     */
    exec(filepath: any, params?: {}, opt?: {}): ForkProcess;
    /**
     * 创建子进程
     */
    createProcess(opt?: {}): ForkProcess;
    /**
     * 获取当前pids
     */
    getPids(): string[];
    /**
     * 异步执行一个job文件 todo this指向
     */
    execPromise(filepath: any, params?: {}, opt?: {}): Promise<ForkProcess>;
}
import EventEmitter = require("events");
import { ForkProcess } from "./forkProcess";
