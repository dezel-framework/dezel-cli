"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
/**
 * @class AssetManager
 * @since 0.7.0
 */
class AssetManager extends events_1.EventEmitter {
    //--------------------------------------------------------------------------
    // Methods
    //--------------------------------------------------------------------------
    /**
     * @constructor
     * @since 0.1.0
     */
    constructor(options) {
        super();
        //--------------------------------------------------------------------------
        // Properties
        //--------------------------------------------------------------------------
        /**
         * @property bundlers
         * @since 0.1.0
         */
        this.bundlers = [];
        //--------------------------------------------------------------------------
        // Private API
        //--------------------------------------------------------------------------
        /**
         * @property assets
         * @since 0.1.0
         * @hidden
         */
        this.assets = new Map();
        this.bundlers = options.bundlers;
    }
    /**
     * @method append
     * @since 0.1.0
     */
    append(name, data) {
        this.assets.set(name, data);
        return this;
    }
    /**
     * @method remove
     * @since 0.1.0
     */
    remove(name) {
        this.assets.delete(name);
        return this;
    }
    /**
     * @method handle
     * @since 0.1.0
     */
    handle(file) {
        return this.bundlers.some(bundler => bundler.handle(file));
    }
    /**
     * @method bundle
     * @since 0.1.0
     */
    bundle(bundler, callback) {
        let bundles = {};
        Array.from(this.assets.entries()).reverse().forEach(entry => {
            let name = entry[0];
            let data = entry[1];
            this.bundlers.forEach(assetBundler => {
                if (assetBundler.handle(name)) {
                    assetBundler.bundle(name, data, bundles, bundler);
                }
            });
        });
        Object.entries(bundles).forEach(entry => {
            let name = entry[0];
            let data = entry[1];
            callback(name, data);
        });
        return this;
    }
    /**
     * @method output
     * @since 0.1.0
     */
    output(bundler, callback) {
        this.bundle(bundler, (file, data) => {
            let stream = callback(file);
            if (stream) {
                stream.write(data);
                stream.end();
            }
        });
        return this;
    }
}
exports.AssetManager = AssetManager;
