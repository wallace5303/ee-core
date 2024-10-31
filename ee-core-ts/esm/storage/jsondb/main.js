import * as lodash from "lodash";
import assert from "assert";
import * as is from "is-type-of";
import FileSync from "./adapters/FileSync.js";
class JsonDBMain {
    constructor(options = {}) {
        this.opt = options;
    }
    create() {
        const adapter = new FileSync(this.opt);
        assert(typeof adapter === 'object', 'An adapter must be provided');
        // Create a fresh copy of lodash
        const _ = lodash.runInContext();
        const db = _.chain({});
        // Add write function to lodash
        // Calls save before returning result
        _.prototype.write = _.wrap(_.prototype.value, function (func) {
            const funcRes = func.apply(this);
            return db.write(funcRes);
        });
        function plant(state) {
            db.__wrapped__ = state;
            return db;
        }
        // Expose _ for mixins
        db._ = _;
        db.read = () => {
            const r = adapter.read();
            return is.promise(r) ? r.then(plant) : plant(r);
        };
        db.write = returnValue => {
            const w = adapter.write(db.getState());
            return is.promise(w) ? w.then(() => returnValue) : returnValue;
        };
        db.getState = () => db.__wrapped__;
        db.setState = state => plant(state);
        return db.read();
    }
}
export default JsonDBMain;
