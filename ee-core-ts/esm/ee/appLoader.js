import { EeLoader as EeLoader$0 } from "../core/index.js";
const EeLoader = { EeLoader: EeLoader$0 }.EeLoader;
/**
 * App Loader
 * @see
 */
class AppLoader extends EeLoader {
    /**
     * loadPlugin first, then loadConfig
     * @since 1.0.0
     */
    loadConfig() {
        super.loadConfig();
    }
    /**
     * Load all directories in convention
     * @since 1.0.0
     */
    load() {
        // app > plugin
        this.loadService();
        // app
        this.loadController();
    }
    /**
     * load addons
     * @since 1.0.0
     */
    loadAddons() {
        this.loadAddon();
    }
    /**
     * load electron modules
     * @since 1.0.0
     */
    loadElectron() {
    }
}
export default AppLoader;