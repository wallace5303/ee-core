import { EventEmitter } from 'node:events';
import { SpawnProcess } from "./spawnProcess";
import internal = require("stream");
export declare class CrossProcess {
    emitter: EventEmitter<[never]>;
    children: {};
    childrenMap: {};
    create(): Promise<void>;
    run(service: string, opt?: {}): Promise<SpawnProcess>;
    killAll(): void;
    kill(pid: string|number): void;
    killByName(name: string): void;
    getUrl(name: string): any;
    getProcByName(name: string): any;
    getProc(pid: string|number): any;
    getPids(): string[];
    _initEventEmitter(): void;
}
export declare let cross: CrossProcess;
