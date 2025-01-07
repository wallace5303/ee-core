export class EventBus {
    lifecycleEvents: {};
    eventsMap: {};
    register(eventName: any, handler: any): void;
    emitLifecycle(eventName: any, ...args: any[]): void;
    on(eventName: any, handler: any): void;
    emit(eventName: any, ...args: any[]): void;
}
export const eventBus: EventBus;
export const Ready: "ready";
export const ElectronAppReady: "electron-app-ready";
export const WindowReady: "window-ready";
export const Preload: "preload";
export const BeforeClose: "before-close";
