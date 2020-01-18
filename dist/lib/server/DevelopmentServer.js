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
     * @constructors
     * @since 1.0.0
     */
    constructor(options) {
        this.file = options.file;
        this.publicPath = options.publicPath;
        this.outputName = options.outputName;
        let port = options.port;
        let host = options.host;
        Promise.all([
            getDefaultServerHost_1.getDefaultServerHost(),
            getDefaultServerPort_1.getDefaultServerPort(8080)
        ]).then(([defaultHost, defaultPort]) => {
            this.host = host || defaultHost;
            this.port = defaultPort;
            let client = path_1.default.join(__dirname, 'reload/client.js');
            this.bundler = new Bundler_1.Bundler(this, [client]);
            this.bundler.on('update', this.onBundleUpdate.bind(this));
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
                console.log(' -> File:        ' + chalk_1.default.blue(this.file));
                console.log(' -> Host:        ' + chalk_1.default.blue(this.host));
                console.log(' -> Port:        ' + chalk_1.default.blue(this.port));
                console.log(' -> Public path: ' + chalk_1.default.blue(this.publicPath));
                console.log(' -> Output name: ' + chalk_1.default.blue(this.outputName));
            });
            this.socket = new ws_1.Server({ server: this.server, perMessageDeflate: false });
        });
    }
    /**
     * @method send
     * @since 0.1.0
     * @hidden
     */
    send(data) {
        let string = JSON.stringify(data);
        try {
            this.socket.clients.forEach(client => {
                if (client.readyState === client.OPEN) {
                    client.send(string, { binary: false });
                }
            });
        }
        catch (err) {
            console.error('Error sending LiveReload event to client:');
            console.error(err);
        }
    }
    /**
     * @method onBundleUpdate
     * @since 0.1.0
     * @hidden
     */
    onBundleUpdate(files) {
        console.log(chalk_1.default.green('Bundle updated:'));
        console.log(files.map(file => chalk_1.default.red(' -> ') + file).join('\n'));
        let styles = files.every(file => file.match(/\.style$/) ||
            file.match(/\.style\.ios$/) ||
            file.match(/\.style\.android$/));
        if (styles) {
            console.log(chalk_1.default.blue(' -> Reloading styles...'));
            this.send({ action: 'reload-styles' });
        }
        else {
            console.log(chalk_1.default.blue(' -> Reloading...'));
            this.send({ action: 'reload' });
        }
    }
}
exports.DevelopmentServer = DevelopmentServer;
