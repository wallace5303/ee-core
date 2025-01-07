export declare class ChildPoolJob extends EventEmitter<[never]> {
    constructor(opt?: {});
    config: any;
    boundMap: Map<any, any>;
    children: {};
    min: number;
    max: number;
    strategy: string;
    weights: any[];
    LB: LoadBalancer;
    /**
     * 初始化监听
     */
    _initEvents(): void;
    /**
     * 移除对象
     */
    _removeChild(pid: any): void;
    /**
     * 创建一个池子
     */
    create(number?: number): Promise<string[]>;
    /**
     * 子进程创建后处理
     */
    _childCreated(childProcess: any): void;
    /**
     * 执行一个job文件
     */
    run(filepath: any, params?: {}): any;
    /**
     * 异步执行一个job文件
     */
    runPromise(filepath: any, params?: {}): Promise<any>;
    /**
     * 获取绑定的进程对象
     */
    getBoundChild(boundId: any): any;
    /**
     * 通过pid获取一个子进程对象
     */
    getChildByPid(pid: any): any;
    /**
     * 获取一个子进程对象
     */
    getChild(): any;
    /**
     * 获取当前pids
     */
    getPids(): string[];
    /**
     * kill all
     * @param type {String} - 'sequence' | 'parallel'
     */
    killAll(type?: string): void;
}
import EventEmitter = require("events");
import LoadBalancer = require("../load-balancer");
