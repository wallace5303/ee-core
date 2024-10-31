import ElectronEgg from "./main/index.js";
import EE from "./ee/index.js";
import Controller from "./controller/baseContextClass.js";
import Service from "./services/baseContextClass.js";
import Storage from "./storage/index.js";
import Utils from "./old-utils";
import Socket from "./socket/index.js";
export const Application = EE.Application;
export { ElectronEgg };
export { Controller };
export { Service };
export { Storage };
export { Socket };
export { Utils };
export default {
    ElectronEgg,
    Application,
    Controller,
    Service,
    Storage,
    Socket,
    Utils
};
