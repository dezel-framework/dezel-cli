"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @enum AssetType
 * @since 0.1.0
 */
var AssetType;
(function (AssetType) {
    AssetType[AssetType["NONE"] = 0] = "NONE";
    AssetType[AssetType["STYLE"] = 1] = "STYLE";
    AssetType[AssetType["STYLE_IOS"] = 2] = "STYLE_IOS";
    AssetType[AssetType["STYLE_ANDROID"] = 3] = "STYLE_ANDROID";
})(AssetType = exports.AssetType || (exports.AssetType = {}));
/**
 * @enum Asset
 * @since 0.1.0
 */
class Asset {
    //--------------------------------------------------------------------------
    // Methods
    //--------------------------------------------------------------------------
    /**
     * @constructor
     * @since 1.0.0
     */
    constructor(file) {
        //--------------------------------------------------------------------------
        // Properties
        //--------------------------------------------------------------------------
        /**
         * @property data
         * @since 0.1.0
         */
        this.data = '';
        /**
         * @property type
         * @since 0.1.0
         */
        this.type = AssetType.NONE;
        /**
         * @property kind
         * @since 0.1.0
         */
        this.kind = '';
        /**
         * @property extn
         * @since 0.1.0
         */
        this.rule = '';
        this.file = file;
        let match = this.parse(file);
        if (match == null) {
            return;
        }
        this.type = AssetType.STYLE;
        this.kind = 'any';
        this.rule = 'any';
        switch (match[2]) {
            case 'ios':
                this.type = AssetType.STYLE_IOS;
                this.kind = 'style.ios';
                this.rule = 'ios';
                break;
            case 'android':
                this.type = AssetType.STYLE_ANDROID;
                this.kind = 'style.android';
                this.rule = 'android';
                break;
        }
    }
    //--------------------------------------------------------------------------
    // Private API
    //--------------------------------------------------------------------------
    /**
     * @method parse
     * @since 1.0.0
     * @hidden
     */
    parse(file) {
        return file.match(/\.style(\.([ios|android]+))?$/);
    }
}
exports.Asset = Asset;
