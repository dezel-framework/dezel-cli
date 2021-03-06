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
const path_1 = __importDefault(require("path"));
const Bundler_1 = require("../lib/bundler/Bundler");
const Command_1 = require("../lib/command/Command");
/**
 * @class Build
 * @since 0.1.0
 */
class Build extends Command_1.Command {
    /**
     * @inherited
     * @method execute
     * @since 0.1.0
     */
    execute(options) {
        return __awaiter(this, void 0, void 0, function* () {
            let { file, outputPath, outputName } = options;
            if (file) {
                file = path_1.default.join(process.cwd(), file);
            }
            else {
                file = path_1.default.join(process.cwd(), '/src/index.ts');
            }
            if (outputPath) {
                outputPath = path_1.default.join(process.cwd(), outputPath);
            }
            else {
                outputPath = path_1.default.join(process.cwd(), 'app');
            }
            if (outputName == null) {
                outputName = 'app';
            }
            let bundler = new Bundler_1.Bundler({
                file,
                outputPath,
                outputName,
                minify: true
            });
            bundler.bundle();
            return null;
        });
    }
}
exports.default = Build;
