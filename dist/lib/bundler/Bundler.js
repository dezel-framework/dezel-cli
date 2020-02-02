"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const through2_1 = __importDefault(require("through2"));
const tinyify_1 = __importDefault(require("tinyify"));
const tsify_1 = __importDefault(require("tsify"));
const browserify_1 = __importDefault(require("browserify"));
const events_1 = require("events");
const StyleBundler_1 = require("../asset/style/StyleBundler");
const AssetManager_1 = require("../asset/AssetManager");
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
    constructor(options) {
        super();
        this.file = options.file;
        this.outputPath = options.outputPath;
        this.outputName = options.outputName;
        this.minify = options.minify;
        let opts = {
            debug: options.minify == false,
            cache: {},
            packageCache: {},
            insertGlobalVars: Object.assign({}, options.variables)
        };
        let transformer = (file) => {
            let result = this.onTransform(file);
            if (result == null) {
                result = through2_1.default();
            }
            return result;
        };
        this.bundler = browserify_1.default(options.file, opts);
        this.bundler.transform(transformer, { global: true });
        this.bundler.plugin(tsify_1.default);
        if (options.minify) {
            this.bundler.plugin(tinyify_1.default);
        }
        let includes = options.includes;
        if (includes) {
            includes.forEach(file => this.bundler.add(file));
        }
        this.assets = new AssetManager_1.AssetManager({
            bundlers: [
                new StyleBundler_1.StyleBundler
            ]
        });
    }
    /**
     * @method bundle
     * @since 0.1.0
     */
    bundle() {
        console.log('');
        console.log(' -> Input file:  ' + chalk_1.default.blue(this.file));
        console.log(' -> Output path: ' + chalk_1.default.blue(this.outputPath));
        console.log(' -> Output name: ' + chalk_1.default.blue(this.outputName));
        console.log(' -> Minify       ' + chalk_1.default.blue(this.minify ? 'Yes' : 'No'));
        console.log('');
        let writer = this.createWriteStream(path_1.default.join(this.outputPath, this.outputName + '.js'));
        this.bundler.bundle().pipe(writer).on('finish', () => {
            this.assets.output(this, name => this.createWriteStream(path_1.default.join(this.outputPath, name)));
        });
    }
    //--------------------------------------------------------------------------
    // Events
    //--------------------------------------------------------------------------
    /**
     * @method onTransform
     * @since 0.1.0
     * @hidden
     */
    onTransform(file) {
        let handle = this.assets.handle(file);
        if (handle == false) {
            return null;
        }
        return through2_1.default((data, enc, next) => {
            this.assets.append(file, data);
            next();
        }, (done) => {
            done();
        });
    }
    /**
     * @method createWriteStream
     * @since 0.1.0
     * @hidden
     */
    createWriteStream(file) {
        return fs_1.default.createWriteStream(file).on('finish', () => console.log(chalk_1.default.green('Updated: ' + file)));
    }
}
exports.Bundler = Bundler;
