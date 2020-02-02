import { EventEmitter } from 'events'
import { WriteStream } from 'fs'
import { Bundler } from '../bundler/Bundler'
import { AssetBundler } from './AssetBundler'
import chalk = require('chalk')

/**
 * @class AssetBundler
 * @since 0.7.0
 */
export interface AssetManagerOptions {
	bundlers: Array<AssetBundler>
}

/**
 * @class AssetManager
 * @since 0.7.0
 */
export class AssetManager extends EventEmitter {

	//--------------------------------------------------------------------------
	// Properties
	//--------------------------------------------------------------------------

	/**
	 * @property bundlers
	 * @since 0.1.0
	 */
	public readonly bundlers: Array<AssetBundler> = []

	//--------------------------------------------------------------------------
	// Methods
	//--------------------------------------------------------------------------

	/**
	 * @constructor
	 * @since 0.1.0
	 */
	constructor(options: AssetManagerOptions) {
		super()
		this.bundlers = options.bundlers
	}

	/**
	 * @method append
	 * @since 0.1.0
	 */
	public append(name: string, data: string) {
		this.assets.set(name, data)
		return this
	}

	/**
	 * @method remove
	 * @since 0.1.0
	 */
	public remove(name: string) {
		this.assets.delete(name)
		return this
	}

	/**
	 * @method handle
	 * @since 0.1.0
	 */
	public handle(file: string) {
		return this.bundlers.some(bundler => bundler.handle(file))
	}

	/**
	 * @method bundle
	 * @since 0.1.0
	 */
	public bundle(bundler: Bundler, callback: BundleCallback) {

		let bundles: Dictionary<string> = {}

		Array.from(this.assets.entries()).reverse().forEach(entry => {

			let name = entry[0]
			let data = entry[1]

			this.bundlers.forEach(assetBundler => {
				if (assetBundler.handle(name)) {
					assetBundler.bundle(name, data, bundles, bundler)
				}
			})

		})

		Object.entries(bundles).forEach(entry => {

			let name = entry[0]
			let data = entry[1]
			callback(name, data)

		})

		return this
	}

	/**
	 * @method output
	 * @since 0.1.0
	 */
	public output(bundler: Bundler, callback: OutputCallback) {

		this.bundle(bundler, (file, data) => {

			let stream = callback(file)
			if (stream) {
				stream.write(data)
				stream.end()
			}

		})

		return this
	}

	//--------------------------------------------------------------------------
	// Private API
	//--------------------------------------------------------------------------

	/**
	 * @property assets
	 * @since 0.1.0
	 * @hidden
	 */
	private assets: Map<string, string> = new Map()

}

/**
 * @type BundleCallback
 * @since 0.1.0
 */
export type BundleCallback = (name: string, data: string) => void

/**
 * @type OutputCallback
 * @since 0.1.0
 */
export type OutputCallback = (name: string) => WriteStream