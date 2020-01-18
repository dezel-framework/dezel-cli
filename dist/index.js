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
const commander_1 = __importDefault(require("commander"));
/**
 * @function cli
 * @since 0.1.0
 */
function cli(args) {
    commander_1.default.version('0.1.0');
    /**
     * @command watch
     * @since 0.1.0
     */
    commander_1.default
        .command('watch')
        .option('-f, --file [file]', 'The main TS file, defaults to src/index.ts')
        .option('-h, --host [host]', 'The development server host, defaults to the local IP.')
        .option('-p, --port [port]', 'The development server port, defaults to 8080.')
        .option('--public-path [publicPath]', 'The path that the assets will be served at, defaults to /')
        .option('--output-name [outputName]', 'The name that will prefix outputed file, defaults to app')
        .action((options) => {
        run('./commands/watch', options);
    });
    if (args.length) {
        commander_1.default.parse(args);
    }
    else {
        commander_1.default.outputHelpInformation();
    }
}
exports.cli = cli;
/**
 * @function run
 * @since 0.1.0
 */
function run(path, options) {
    return __awaiter(this, void 0, void 0, function* () {
        let constructor = require(path).default;
        if (constructor == null) {
            throw new Error('Cannot run command at path ' + path);
        }
        let instance = new constructor();
        yield instance.execute(options);
        yield instance.cleanup();
    });
}
