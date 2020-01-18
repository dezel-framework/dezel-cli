import Path from 'path'
import through from 'through2'
import tsify from 'tsify'
import url from 'url'
import watchifyMiddleware from 'watchify-middleware'
import browserify, { BrowserifyObject } from 'browserify'
import { EventEmitter } from 'events'
import { DevelopmentServer } from '../DevelopmentServer'

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
	constructor(server: DevelopmentServer, includes: Array<string> = []) {

		super()

		this.server = server

		let base = this.server.outputName
		if (base == '') {
			base = 'app'
		}

		this.assets[base + '.style.ios'] = ''
		this.assets[base + '.style.android'] = ''

		this.createBundler()
		this.createWatcher()

		for (let file of includes) {
			this.bundler.add(file)
		}

		this.bundler.on('update', (ids: any) => {
			this.emit('update', ids)
		})
	}

	/**
	 * @method resolve
	 * @since 0.1.0
	 */
	public resolve(req: Request, res: Response) {

		if (req.url == null) {
			return
		}

		let resource = url.parse(req.url).pathname
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

		if (type.match(/style(\.[ios|android])?/)) {

			let source = this.assets[this.server.outputName + '.' + type]
			if (source) {
				res.write(source)
				res.end()
				return
			}

			res.writeHead(404)
			res.end()

			return
		}

		this.watcher(req, res)
	}

	/**
	 * @method include
	 * @since 0.1.0
	 */
	public include(file: string) {
		this.bundler.add(file)
	}

	//--------------------------------------------------------------------------
	// Private API
	//--------------------------------------------------------------------------

	/**
	 * @property assets
	 * @since 0.1.0
	 * @hidden
	 */
	private assets: Dictionary<string> = {}

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

		this.bundler = browserify(this.server.file, options)
		this.bundler.transform(file => this.bundle(file))
		this.bundler.plugin(tsify)

		return this
	}

	/**
	 * @method createWatcher
	 * @since 0.1.0
	 * @hidden
	 */
	private createWatcher() {

		this.watcher = watchifyMiddleware(this.bundler, {
			// errorHandler() {
			// 	console.log('error')
			// }
		})

		return this
	}

	/**
	 * @method bundle
	 * @since 0.1.0
	 * @hidden
	 */
	private bundle(file: string) {

		let anyStyles = /\.style$/
		let iosStyles = /\.style\.ios$/
		const ANDROID = /\.style\.android$/

		let isAnyStyle = !!file.match(/\.style$/)
		let isIOSStyle = !!file.match(/\.style\.ios$/)
		let isAndroidSytle = !!file.match(/\.style\.android$/)

		if (isAnyStyle == false &&
			isIOSStyle == false &&
			isAndroidSytle == false) {
			return through()
		}


		return through(

			(chunk, enc, next) => {

				if (file.match(anyStyles) ||
					file.match(iosStyles)) {
					this.assets['app.style.ios'] += chunk
				}

				if (file.match(anyStyles) ||
					file.match(ANDROID)) {
					this.assets['app.style.android'] += chunk
				}

				next()
			},

			(done) => {
				done()
			}
		)
	}
}
