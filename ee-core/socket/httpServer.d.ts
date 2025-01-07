/**
 * http server
 */
export class HttpServer {
    config: any;
    httpApp: any;
    init(): Promise<void>;
    /**
     * 创建服务
     */
    _create(): void;
    /**
     * 路由分发
     */
    _dispatch(ctx: any, next: any): Promise<void>;
    getHttpApp(): any;
}
