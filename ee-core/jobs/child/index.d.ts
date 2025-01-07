import EventEmitter = require("events");
import { ForkProcess } from "./forkProcess";
export declare class ChildJob extends EventEmitter<[never]> {
    constructor();
    jobs: {};
    config: any;
    _initEvents(): void;
    exec(filepath: string, params?: {}, opt?: {}): ForkProcess;
    createProcess(opt?: {}): ForkProcess;
    getPids(): string[];
    execPromise(filepath: string, params?: {}, opt?: {}): Promise<ForkProcess>;
}

