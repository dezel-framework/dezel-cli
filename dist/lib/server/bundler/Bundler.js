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
    constructor(server, includes = []) {
        super();
        //--------------------------------------------------------------------------
        // Private API
        //--------------------------------------------------------------------------
        /**
         * @property assets
         * @since 0.1.0
         * @hidden
         */
        this.assets = {};
        this.server = server;
        let base = this.server.outputName;
        if (base == '') {
            base = 'app';
        }
        this.assets[base + '.style.ios'] = '';
        this.assets[base + '.style.android'] = '';
        this.createBundler();
        this.createWatcher();
        for (let file of includes) {
            this.bundler.add(file);
        }
        this.bundler.on('update', (ids) => {
            this.emit('update', ids);
        });
    }
    /**
     * @method resolve
     * @since 0.1.0
     */
    resolve(req, res) {
        if (req.url == null) {
            return;
        }
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
        if (type.match(/style(\.[ios|android])?/)) {
            let source = this.assets[this.server.outputName + '.' + type];
            if (source) {
                res.write(source);
                res.end();
                return;
            }
            res.writeHead(404);
            res.end();
            return;
        }
        this.watcher(req, res);
    }
    /**
     * @method include
     * @since 0.1.0
     */
    include(file) {
        this.bundler.add(file);
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
        this.bundler = browserify_1.default(this.server.file, options);
        this.bundler.transform(file => this.bundle(file));
        this.bundler.plugin(tsify_1.default);
        return this;
    }
    /**
     * @method createWatcher
     * @since 0.1.0
     * @hidden
     */
    createWatcher() {
        this.watcher = watchify_middleware_1.default(this.bundler, {
        // errorHandler() {
        // 	console.log('error')
        // }
        });
        return this;
    }
    /**
     * @method bundle
     * @since 0.1.0
     * @hidden
     */
    bundle(file) {
        let anyStyles = /\.style$/;
        let iosStyles = /\.style\.ios$/;
        const ANDROID = /\.style\.android$/;
        let isAnyStyle = !!file.match(/\.style$/);
        let isIOSStyle = !!file.match(/\.style\.ios$/);
        let isAndroidSytle = !!file.match(/\.style\.android$/);
        if (isAnyStyle == false &&
            isIOSStyle == false &&
            isAndroidSytle == false) {
            return through2_1.default();
        }
        return through2_1.default((chunk, enc, next) => {
            if (file.match(anyStyles) ||
                file.match(iosStyles)) {
                this.assets['app.style.ios'] += chunk;
            }
            if (file.match(anyStyles) ||
                file.match(ANDROID)) {
                this.assets['app.style.android'] += chunk;
            }
            next();
        }, (done) => {
            done();
        });
    }
}
exports.Bundler = Bundler;
