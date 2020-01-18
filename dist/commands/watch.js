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
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../lib/command/Command");
const DevelopmentServer_1 = require("../lib/server/DevelopmentServer");
/**
 * @class Watch
 * @since 0.1.0
 */
class Watch extends Command_1.Command {
    /**
     * @inherited
     * @method execute
     * @since 0.1.0
     */
    execute(options) {
        return __awaiter(this, void 0, void 0, function* () {
            new DevelopmentServer_1.DevelopmentServer({
                file: options.file || process.cwd() + '/src/index.ts',
                host: options.host,
                port: options.port,
                publicPath: options.publicPath || '/',
                outputName: options.outputName || 'app'
            });
            return null;
        });
    }
}
exports.default = Watch;
