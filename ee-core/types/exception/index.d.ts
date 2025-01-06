/**
 * 捕获异常
 */
export function loadException(): void;
/**
 * 当进程上抛出异常而没有被捕获时触发该事件，并且使异常静默。
 */
export function uncaughtExceptionHandler(): void;
/**
 * 当promise中reject的异常在同步任务中没有使用catch捕获就会触发该事件，
 * 即便是在异步情况下使用了catch也会触发该事件
 */
export function unhandledRejectionHandler(): void;
/**
 * 当进程上抛出异常而没有被捕获时触发该事件。
 */
export function uncaughtExceptionMonitorHandler(): void;
