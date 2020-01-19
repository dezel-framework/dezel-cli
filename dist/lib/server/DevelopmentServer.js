"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
const path_1 = __importDefault(require("path"));
const http_1 = __importDefault(require("http"));
const ws_1 = require("ws");
const getDefaultServerHost_1 = require("./network/getDefaultServerHost");
const getDefaultServerPort_1 = require("./network/getDefaultServerPort");
const Bundler_1 = require("./bundler/Bundler");
/**
 * @class DevelopmentServer
 * @since 0.1.0
 */
class DevelopmentServer {
    //--------------------------------------------------------------------------
    // Methods
    //--------------------------------------------------------------------------
    /**
     * @constructor
     * @since 1.0.0
     */
    constructor(options) {
        this.file = options.file;
        this.publicPath = options.publicPath;
        this.outputName = options.outputName;
        let port = options.port || 8080;
        let host = options.host;
        Promise.all([
            getDefaultServerHost_1.getDefaultServerHost(host),
            getDefaultServerPort_1.getDefaultServerPort(port)
        ]).then(([defaultHost, defaultPort]) => {
            this.host = defaultHost;
            this.port = defaultPort;
            let options = {
                includes: [
                    path_1.default.join(__dirname, 'reload/client.js')
                ]
            };
            this.bundler = new Bundler_1.Bundler(this, options);
            this.bundler.on('update', this.onBundlerUpdate.bind(this));
            this.bundler.on('error', this.onBundlerError.bind(this));
            this.start();
        });
    }
    /**
     * @method start
     * @since 0.1.0
     * @hidden
     */
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            this.server = http_1.default.createServer((req, res) => {
                this.bundler.resolve(req, res);
            });
            this.server.listen(this.port, this.host, () => {
                console.log(chalk_1.default.green('Dezel development server started'));
                console.log(' -> Input file:  ' + chalk_1.default.blue(this.file));
                console.log(' -> Host:        ' + chalk_1.default.blue(this.host));
                console.log(' -> Port:        ' + chalk_1.default.blue(this.port));
                console.log(' -> Public path: ' + chalk_1.default.blue(this.publicPath));
                console.log(' -> Output name: ' + chalk_1.default.blue(this.outputName));
                console.log('');
            });
            this.socket = new ws_1.Server({ server: this.server, perMessageDeflate: false });
        });
    }
    /**
     * @method reload
     * @since 0.1.0
     * @hidden
     */
    reload(type, message) {
        let action;
        switch (type) {
            case 'scripts':
                action = 'reload';
                break;
            case 'styles':
                action = 'reload-styles';
                break;
            default:
                throw new Error('Unexpected error.');
        }
        console.log(chalk_1.default.blue(' -> ' + message));
        try {
            let data = JSON.stringify({ action });
            this.socket.clients.forEach(client => {
                client.send(data, { binary: false });
            });
        }
        catch (err) {
            console.error('Error sending reload message to the client:');
            console.error(err);
        }
    }
    /**
     * @method onBundlerUpdate
     * @since 0.1.0
     * @hidden
     */
    onBundlerUpdate(files) {
        console.log(chalk_1.default.green('Bundle updated:'));
        console.log(files.map(file => chalk_1.default.red(' -> ') + file).join('\n'));
        let styles = files.every(file => file.match(/\.style$/) ||
            file.match(/\.style\.ios$/) ||
            file.match(/\.style\.android$/));
        if (styles) {
            this.reload('styles', 'Reloading styles');
            return;
        }
        this.reload('scripts', 'Reloading');
    }
    /**
     * @method onBundlerError
     * @since 0.1.0
     * @hidden
     */
    onBundlerError(error) {
        console.error(chalk_1.default.red(error.stack || error.message || error));
    }
}
exports.DevelopmentServer = DevelopmentServer;
