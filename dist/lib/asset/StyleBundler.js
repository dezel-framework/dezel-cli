"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AssetBundler_1 = require("./AssetBundler");
/**
 * @class AssetBundler
 * @since 0.1.0
 */
class StyleBundler extends AssetBundler_1.AssetBundler {
    /**
     * @inherited
     * @method handle
     * @since 0.1.0
     */
    handle(file) {
        return (file.match(/\.style$/) != null ||
            file.match(/\.style\.ios$/) != null ||
            file.match(/\.style\.android$/) != null);
    }
    /**
     * @inherited
     * @method bundle
     * @since 0.1.0
     */
    bundle(file, data, bundles, bundler) {
        let name = bundler.outputName;
        if (bundles[name + '.style.ios'] == null) {
            bundles[name + '.style.ios'] = '';
        }
        if (bundles[name + '.style.android'] == null) {
            bundles[name + '.style.android'] = '';
        }
        let match = file.match(/\.style(\.([ios|android]+))?$/);
        if (match == null) {
            return;
        }
        if (match[2] == null) {
            bundles[name + '.style.ios'] += data;
            bundles[name + '.style.android'] += data;
            return;
        }
        if (match[2] == 'ios') {
            bundles[name + '.style.ios'] += data;
            return;
        }
        if (match[2] == 'android') {
            bundles[name + '.style.android'] += data;
            return;
        }
    }
}
exports.StyleBundler = StyleBundler;
