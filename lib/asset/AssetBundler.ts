import { Bundler } from '../bundler/Bundler'

/**
 * @class AssetBundler
 * @since 0.1.0
 */
export abstract class AssetBundler {

	/**
	 * @method handle
	 * @since 0.1.0
	 */
	abstract handle(file: string): boolean

	/**
	 * @method bundle
	 * @since 0.1.0
	 */
	abstract bundle(file: string, data: string, bundles: Dictionary<string>, bundler: Bundler): void

}