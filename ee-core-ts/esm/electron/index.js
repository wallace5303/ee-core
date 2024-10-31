import Window from "./window/index.js";
const Electron = {
    /**
     * 兼容1.x版本api
     */
    get mainWindow() {
        return Window.getMainWindow();
    },
    /**
     * extra
     */
    extra: {
        closeWindow: false,
    },
};
export default Electron;
