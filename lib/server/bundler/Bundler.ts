import Path from 'path'
import through from 'through2'
import tsify from 'tsify'
import url from 'url'
import watchifyMiddleware from 'watchify-middleware'
import browserify, { BrowserifyObject } from 'browserify'
import { EventEmitter } from 'events'
import { Asset } from '../asset/Asset'
import { AssetType } from '../asset/Asset'
import { DevelopmentServer } from '../DevelopmentServer'

/**
 * @interface BundlerOptions
 * @since 0.1.0
 */
export interface BundlerOptions {
	includes?: Array<string>
}

/**
 * @class Bundler
 * @since 0.1.0
 */
export class Bundler extends EventEmitter {

	//--------------------------------------------------------------------------
	// Properies
	//--------------------------------------------------------------------------

	/**
	 * @property server
	 * @since 0.1.0
	 */
	public readonly server: DevelopmentServer

	//--------------------------------------------------------------------------
	// Methods
	//--------------------------------------------------------------------------

	/**
	 * @constructor
	 * @since 0.1.0
	 */
	constructor(server: DevelopmentServer, options: BundlerOptions = {}) {

		super()

		this.server = server

		this.createBundler()
		this.createWatcher()

		let includes = options.includes
		if (includes) {
			includes.forEach(file => this.bundler.add(file))
		}
	}

	/**
	 * @method resolve
	 * @since 0.1.0
	 */
	public resolve(req: Request, res: Response) {

		let resource = url.parse(req.url!).pathname
		if (resource == null) {
			return
		}

		let path = Path.dirname(resource)
		let file = Path.basename(resource)

		let [
			name,
			type
		] = file.split(/\.(.+)/)

		if (this.server.publicPath != path ||
			this.server.outputName != name) {
			res.writeHead(404)
			res.end()
			return
		}

		if (type == 'style.ios' ||
			type == 'style.android') {

			let bundle = this.build(type)
			if (bundle) {
				res.write(bundle)
				res.end()
				return
			}

			res.writeHead(404)
			res.end()
			return
		}

		this.watcher(req, res)
	}

	//--------------------------------------------------------------------------
	// Events
	//--------------------------------------------------------------------------

	/**
	 * @method onUpdate
	 * @since 0.1.0
	 * @hidden
	 */
	protected onUpdate(files: Array<string>) {
		this.bundler.once('bundle', bundle => bundle.once('end', () => this.emit('update', files)))
	}

	/**
	 * @method onBundle
	 * @since 0.1.0
	 * @hidden
	 */
	protected onBundle(bundle: NodeJS.ReadableStream) {
		this.emit('bundle', bundle)
	}

	/**
	 * @method onTransform
	 * @since 0.1.0
	 * @hidden
	 */
	protected onTransform(file: string) {

		let asset = this.assets.get(file)
		if (asset == null) {
			asset = new Asset(file)
		}

		if (asset.type != AssetType.STYLE &&
			asset.type != AssetType.STYLE_IOS &&
			asset.type != AssetType.STYLE_ANDROID) {
			return null
		}

		delete this.bundle['style.ios']
		delete this.bundle['style.android']

		this.assets.set(file, asset)

		return through(

			(data, enc, next) => {
				asset!.data = data
				next()
			},

			(done) => {
				done()
			}
		)
	}

	//--------------------------------------------------------------------------
	// Private API
	//--------------------------------------------------------------------------

	/**
	 * @property assets
	 * @since 0.1.0
	 * @hidden
	 */
	private assets: Map<string, Asset> = new Map()

	/**
	 * @property bundle
	 * @since 0.1.0
	 * @hidden
	 */
	private bundle: Dictionary<string> = {}

	/**
	 * @property bundler
	 * @since 0.1.0
	 * @hidden
	 */
	private bundler: BrowserifyObject

	/**
	 * @property watcher
	 * @since 0.1.0
	 * @hidden
	 */
	private watcher: any

	/**
	 * @method createBundler
	 * @since 0.1.0
	 * @hidden
	 */
	private createBundler() {

		let devServer = {
			host: this.server.host,
			port: this.server.port,
			publicPath: this.server.publicPath,
			outputName: this.server.outputName
		}

		let options = {
			debug: true,
			cache: {},
			packageCache: {},
			insertGlobalVars: {
				devServer: function () {
					return JSON.stringify(devServer)
				}
			}
		}

		let transformer = (file: string) => {

			let result = this.onTransform(file)
			if (result == null) {
				result = through()
			}

			return result
		}

		this.bundler = browserify(this.server.file, options)
		this.bundler.transform(transformer, { global: true })
		this.bundler.plugin(tsify)

		this.bundler.on('update', this.onUpdate.bind(this))
		this.bundler.on('bundle', this.onBundle.bind(this))

		return this
	}

	/**
	 * @method createWatcher
	 * @since 0.1.0
	 * @hidden
	 */
	private createWatcher() {

		this.watcher = watchifyMiddleware(this.bundler, {
			errorHandler: (error: Error) => this.emit('error', error)
		})

		return this
	}

	/**
	 * @method build
	 * @since 0.1.0
	 * @hidden
	 */
	private build(type: string) {

		let bundle = this.bundle[type]
		if (bundle) {
			return bundle
		}

		let filter = (asset: Asset) => {
			return asset.kind == 'any' || asset.kind == type
		}

		let mapper = (asset: Asset) => {
			return asset.data
		}

		return this.bundle[type] = Array.from(this.assets.values()).filter(filter).map(mapper).reverse().join('\n')
	}
}
