export declare class ChildMessage {
    // 向主进程发消息 for ChildJob 实例
    sendToMain(eventName: any, params?: {}): boolean;
    // 向主进程发消息 for task 实例
    send(eventName: any, params: {}, receiver: any): boolean;
    // 进程退出
    exit(code?: number): never;
    // 发送错误到控制台
    sendErrorToTerminal(err: any): void;
}
