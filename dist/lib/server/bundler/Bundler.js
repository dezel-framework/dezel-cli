"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const through2_1 = __importDefault(require("through2"));
const tsify_1 = __importDefault(require("tsify"));
const url_1 = __importDefault(require("url"));
const watchify_middleware_1 = __importDefault(require("watchify-middleware"));
const browserify_1 = __importDefault(require("browserify"));
const events_1 = require("events");
const Asset_1 = require("../asset/Asset");
const Asset_2 = require("../asset/Asset");
/**
 * @class Bundler
 * @since 0.1.0
 */
class Bundler extends events_1.EventEmitter {
    //--------------------------------------------------------------------------
    // Methods
    //--------------------------------------------------------------------------
    /**
     * @constructor
     * @since 0.1.0
     */
    constructor(server, options = {}) {
        super();
        //--------------------------------------------------------------------------
        // Private API
        //--------------------------------------------------------------------------
        /**
         * @property assets
         * @since 0.1.0
         * @hidden
         */
        this.assets = new Map();
        /**
         * @property bundle
         * @since 0.1.0
         * @hidden
         */
        this.bundle = {};
        this.server = server;
        this.createBundler();
        this.createWatcher();
        let includes = options.includes;
        if (includes) {
            includes.forEach(file => this.bundler.add(file));
        }
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
        let [name, type] = file.split(/\.(.+)/);
        if (this.server.publicPath != path ||
            this.server.outputName != name) {
            res.writeHead(404);
            res.end();
            return;
        }
        if (type == 'style.ios' ||
            type == 'style.android') {
            let bundle = this.build(type);
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
        this.emit('bundle', bundle);
    }
    /**
     * @method onTransform
     * @since 0.1.0
     * @hidden
     */
    onTransform(file) {
        let asset = this.assets.get(file);
        if (asset == null) {
            asset = new Asset_1.Asset(file);
        }
        if (asset.type != Asset_2.AssetType.STYLE &&
            asset.type != Asset_2.AssetType.STYLE_IOS &&
            asset.type != Asset_2.AssetType.STYLE_ANDROID) {
            return null;
        }
        delete this.bundle['style.ios'];
        delete this.bundle['style.android'];
        this.assets.set(file, asset);
        return through2_1.default((data, enc, next) => {
            asset.data = data;
            next();
        }, (done) => {
            done();
        });
    }
    /**
     * @method createBundler
     * @since 0.1.0
     * @hidden
     */
    createBundler() {
        let devServer = {
            host: this.server.host,
            port: this.server.port,
            publicPath: this.server.publicPath,
            outputName: this.server.outputName
        };
        let options = {
            debug: true,
            cache: {},
            packageCache: {},
            insertGlobalVars: {
                devServer: function () {
                    return JSON.stringify(devServer);
                }
            }
        };
        let transformer = (file) => {
            let result = this.onTransform(file);
            if (result == null) {
                result = through2_1.default();
            }
            return result;
        };
        this.bundler = browserify_1.default(this.server.file, options);
        this.bundler.transform(transformer, { global: true });
        this.bundler.plugin(tsify_1.default);
        this.bundler.on('update', this.onUpdate.bind(this));
        this.bundler.on('bundle', this.onBundle.bind(this));
        return this;
    }
    /**
     * @method createWatcher
     * @since 0.1.0
     * @hidden
     */
    createWatcher() {
        this.watcher = watchify_middleware_1.default(this.bundler, {
            errorHandler: (error) => this.emit('error', error)
        });
        return this;
    }
    /**
     * @method build
     * @since 0.1.0
     * @hidden
     */
    build(type) {
        let bundle = this.bundle[type];
        if (bundle) {
            return bundle;
        }
        this.bundle[type] = '';
        Array.from(this.assets.values()).reverse().forEach(asset => {
            let data = asset.data;
            if (data) {
                data += '\n';
            }
            if (asset.kind == 'any' ||
                asset.kind == type) {
                this.bundle[type] += data;
            }
        });
        return this.bundle[type];
    }
}
exports.Bundler = Bundler;
