import path from "path";
/**
 * Html
 */
const Html = {
    getFilepath(name) {
        const pagePath = path.join(__dirname, name);
        return pagePath;
    },
};
export default Html;
