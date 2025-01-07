export class IpcServer {
    directory: string;
    loop(obj: any, pathname: any): void;
    register(exportObj: any, propertyChain: any): void;
    findFn(controller: any, c: any): {
        controller: any;
    };
    init(): void;
}
