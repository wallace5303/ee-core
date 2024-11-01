import path from "path";
import * as is from "is-type-of";
import * as UtilsFn from "../../utils/function.js";
import Utils from "../../utils/index.js";
import { FULLPATH as FULLPATH$0 } from "../file_loader.js";
'use strict';
const FULLPATH = { FULLPATH: FULLPATH$0 }.FULLPATH;
// wrap the class, yield a object with middlewares
function wrapClass(Controller) {
    let proto = Controller.prototype;
    const ret = {};
    // tracing the prototype chain
    while (proto !== Object.prototype) {
        const keys = Object.getOwnPropertyNames(proto);
        for (const key of keys) {
            // getOwnPropertyNames will return constructor
            // that should be ignored
            if (key === 'constructor') {
                continue;
            }
            // skip getter, setter & non-function properties
            const d = Object.getOwnPropertyDescriptor(proto, key);
            // prevent to override sub method
            if (is.function(d.value) && !ret.hasOwnProperty(key)) {
                ret[key] = methodToMiddleware(Controller, key);
                ret[key][FULLPATH] = Controller.prototype.fullPath + '#' + Controller.name + '.' + key + '()';
            }
        }
        proto = Object.getPrototypeOf(proto);
    }
    return ret;
    function methodToMiddleware(Controller, key) {
        return function classControllerMiddleware(...args) {
            const controller = new Controller(this);
            // if (!this.app.config.controller || !this.app.config.controller.supportParams) {
            //   args = [ this ];
            // }
            //args = [ this ];
            return Utils.callFn(controller[key], args, controller);
        };
    }
}
// wrap the method of the object, method can receive ctx as it's first argument
function wrapObject(obj, path, prefix) {
    const keys = Object.keys(obj);
    const ret = {};
    for (const key of keys) {
        if (is.function(obj[key])) {
            const names = UtilsFn.getParamNames(obj[key]);
            if (names[0] === 'next') {
                throw new Error(`controller \`${prefix || ''}${key}\` should not use next as argument from file ${path}`);
            }
            ret[key] = functionToMiddleware(obj[key]);
            ret[key][FULLPATH] = `${path}#${prefix || ''}${key}()`;
        }
        else if (is.object(obj[key])) {
            ret[key] = wrapObject(obj[key], path, `${prefix || ''}${key}.`);
        }
    }
    return ret;
    function functionToMiddleware(func) {
        const objectControllerMiddleware = async function (...args) {
            // if (!this.app.config.controller || !this.app.config.controller.supportParams) {
            //   args = [ this ];
            // }
            return await Utils.callFn(func, args, this);
        };
        for (const key in func) {
            objectControllerMiddleware[key] = func[key];
        }
        return objectControllerMiddleware;
    }
}
export const loadController = moduleExports.loadController;
const moduleExports = {
    /**
     * Load app/controller
     * @param {Object} opt - LoaderOptions
     * @since 1.0.0
     */
    loadController(opt) {
        this.timing.start('Load Controller');
        opt = Object.assign({
            caseStyle: 'lower',
            directory: path.join(this.options.baseDir, 'controller'),
            initializer: (obj, opt) => {
                // return class if it exports a function
                // ```js
                // module.exports = app => {
                //   return class HomeController extends app.Controller {};
                // }
                // ```
                if (is.function(obj) && !is.generatorFunction(obj) && !is.class(obj) && !is.asyncFunction(obj) && !Utils.isBytecodeClass(obj)) {
                    obj = obj(this.app);
                }
                if (is.class(obj) || Utils.isBytecodeClass(obj)) {
                    obj.prototype.pathName = opt.pathName;
                    obj.prototype.fullPath = opt.path;
                    return wrapClass(obj);
                }
                if (is.object(obj)) {
                    return wrapObject(obj, opt.path);
                }
                // support generatorFunction for forward compatbility
                if (is.generatorFunction(obj) || is.asyncFunction(obj)) {
                    return wrapObject({ 'module.exports': obj }, opt.path)['module.exports'];
                }
                return obj;
            },
        }, opt);
        const controllerBase = opt.directory;
        this.loadToApp(controllerBase, 'controller', opt);
        //this.options.logger.info('[ee-core] [core/.../controller] loaded: %s', controllerBase);
        this.timing.end('Load Controller');
    }
};
export default moduleExports;