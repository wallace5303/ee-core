export declare function createLog(config: any): import("egg-logger").EggLoggers;
export declare function loadLog(): any;
declare namespace Instance {
    export let eelog: any;
    let logger_1: {};
    export { logger_1 as logger };
    let coreLogger_1: {};
    export { coreLogger_1 as coreLogger };
}
import logger = Instance.logger;
import coreLogger = Instance.coreLogger;
export { logger, coreLogger };
