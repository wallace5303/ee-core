import ChildMessage from "./childMessage.js";
const EEChildMessage = Symbol('EeCore#Module#ChildMessage');
const message = {
    /**
     * childMessage
     */
    get childMessage() {
        if (!this[EEChildMessage]) {
            this[EEChildMessage] = new ChildMessage();
        }
        return this[EEChildMessage] || null;
    },
};
export default message;
