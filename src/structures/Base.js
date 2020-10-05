'use strict';

class Base {

    /**
     * 
     * @param {Base} sub 
     */
    
    constructor(sub) {
        /**
         * The subclass needing this as reference
         * @name Base
         * @type {Base}
         * @readonly
         */

        Object.defineProperty(this, 'sub', {value: sub});
    }
}

module.exports = Base;