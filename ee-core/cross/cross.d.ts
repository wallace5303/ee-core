export declare class CrossProcess {
    emitter: EventEmitter<[never]>;
    children: {};
    childrenMap: {};
    create(): Promise<void>;
    run(service: any, opt?: {}): Promise<SpawnProcess>;
    killAll(): void;
    kill(pid: any): void;
    killByName(name: any): void;
    getUrl(name: any): any;
    getProcByName(name: any): any;
    getProc(pid: any): any;
    getPids(): string[];
    _initEventEmitter(): void;
}
import EventEmitter = require("events");
import { SpawnProcess } from "./spawnProcess";
export declare let cross: CrossProcess;
