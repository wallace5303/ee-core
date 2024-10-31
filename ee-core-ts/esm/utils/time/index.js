import util from "util";
import ms from "./ms.js";
'use strict';
function humanizeToMs(t) {
    if (typeof t === 'number')
        return t;
    var r = ms(t);
    if (r === undefined) {
        var err = new Error(util.format('humanize-ms(%j) result undefined', t));
        console.warn(err.stack);
    }
    return r;
}
const TIME = {
    humanizeToMs,
    ms
};
export default TIME;
