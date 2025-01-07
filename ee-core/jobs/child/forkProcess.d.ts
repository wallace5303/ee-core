/// <reference types="node" />
declare export class ForkProcess {
    constructor(host: any, opt?: {});
    emitter: EventEmitter<[never]>;
    host: any;
    args: string[];
    sleeping: boolean;
    child: import("child_process").ChildProcess;
    pid: number;
    /**
     * 初始化事件监听
     */
    _init(): void;
    /**
     * event emit
     */
    _eventEmit(m: any): void;
    /**
     * 分发任务
     */
    dispatch(cmd: any, jobPath?: string, ...params: any[]): void;
    /**
     * 调用job的方法
     */
    callFunc(jobPath?: string, funcName?: string, ...params: any[]): void;
    /**
     * kill
     */
    kill(timeout?: number): void;
}
import EventEmitter = require("events");
