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
const internal_ip_1 = __importDefault(require("internal-ip"));
/**
 * @function getDefaultServerHost
 * @since 0.1.0
 */
function getDefaultServerHost(defaultHost) {
    return __awaiter(this, void 0, void 0, function* () {
        if (defaultHost) {
            return defaultHost;
        }
        let host = yield internal_ip_1.default.v4();
        if (host == null) {
            host = 'localhost';
        }
        return host;
    });
}
exports.getDefaultServerHost = getDefaultServerHost;
