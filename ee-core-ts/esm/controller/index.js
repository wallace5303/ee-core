'use strict';
/**
 * BaseContextClass is a base class that can be extended,
 * it's instantiated in context level,
 */
class BaseContextClass {
    /**
     * @class
     * @param {Context} ctx - context instance
     * @since 1.1.0
     */
    constructor(ctx) {
        // todo 兼容旧版本，后续废弃ctx
        if (typeof ctx === 'object') {
            this.app = ctx;
            this.config = ctx.config;
            this.service = ctx.service;
        }
    }
}
export default BaseContextClass;
