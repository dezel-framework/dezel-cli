"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
const path_1 = __importDefault(require("path"));
const url_1 = __importDefault(require("url"));
const watchify_middleware_1 = __importDefault(require("watchify-middleware"));
const Bundler_1 = require("../../bundler/Bundler");
/**
 * @class DevelopmentBundler
 * @since 0.1.0
 */
class DevelopmentBundler extends Bundler_1.Bundler {
    //--------------------------------------------------------------------------
    // Methods
    //--------------------------------------------------------------------------
    /**
     * @constructor
     * @since 0.1.0
     */
    constructor(server, options) {
        super(options);
        /**
         * @property watcher
         * @since 0.1.0
         * @hidden
         */
        this.bundles = {};
        /**
         * @property ready
         * @since 0.1.0
         * @hidden
         */
        this.ready = false;
        this.server = server;
        this.bundler.on('update', this.onUpdate.bind(this));
        this.bundler.on('bundle', this.onBundle.bind(this));
        this.watcher = watchify_middleware_1.default(this.bundler, {
            errorHandler: (error) => this.emit('error', error)
        });
    }
    /**
     * @method resolve
     * @since 0.1.0
     */
    resolve(req, res) {
        let resource = url_1.default.parse(req.url).pathname;
        if (resource == null) {
            return;
        }
        let path = path_1.default.dirname(resource);
        let file = path_1.default.basename(resource);
        let [name] = file.split(/\.(.+)/);
        if (this.server.publicPath != path ||
            this.server.outputName != name) {
            res.writeHead(404);
            res.end();
            return;
        }
        let handle = this.assets.handle(file);
        if (handle) {
            let bundle = this.bundles[file];
            if (bundle) {
                res.write(bundle);
                res.end();
                return;
            }
            res.writeHead(404);
            res.end();
            return;
        }
        this.watcher(req, res);
    }
    //--------------------------------------------------------------------------
    // Events
    //--------------------------------------------------------------------------
    /**
     * @method onUpdate
     * @since 0.1.0
     * @hidden
     */
    onUpdate(files) {
        this.bundler.once('bundle', bundle => bundle.once('end', () => this.emit('update', files)));
    }
    /**
     * @method onBundle
     * @since 0.1.0
     * @hidden
     */
    onBundle(bundle) {
        bundle.on('end', () => {
            this.assets.bundle(this, (file, data) => {
                this.bundles[file] = data;
            });
            if (this.ready == false) {
                this.ready = true;
                console.log(chalk_1.default.blue('Ready'));
            }
        });
        this.emit('bundle', bundle);
    }
}
exports.DevelopmentBundler = DevelopmentBundler;
