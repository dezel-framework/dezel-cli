import chalk from 'chalk'
import Path from 'path'
import url from 'url'
import watchifyMiddleware from 'watchify-middleware'
import { Bundler } from '../../bundler/Bundler'
import { BundlerOptions } from '../../bundler/Bundler'
import { DevelopmentServer } from '../DevelopmentServer'

/**
 * @class DevelopmentBundler
 * @since 0.1.0
 */
export class DevelopmentBundler extends Bundler {

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
	constructor(server: DevelopmentServer, options: BundlerOptions) {

		super(options)

		this.server = server

		this.bundler.on('update', this.onUpdate.bind(this))
		this.bundler.on('bundle', this.onBundle.bind(this))

		this.watcher = watchifyMiddleware(this.bundler, {
			errorHandler: (error: Error) => this.emit('error', error)
		})
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
			name
		] = file.split(/\.(.+)/)

		if (this.server.publicPath != path ||
			this.server.outputName != name) {
			res.writeHead(404)
			res.end()
			return
		}

		let handle = this.assets.handle(file)
		if (handle) {

			let bundle = this.bundles[file]
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

		bundle.on('end', () => {

			this.assets.bundle(this, (file, data) => {
				this.bundles[file] = data
			})

			if (this.ready == false) {
				this.ready = true
				console.log(chalk.blue('Ready'))
			}

		})

		this.emit('bundle', bundle)
	}

	//--------------------------------------------------------------------------
	// Private API
	//--------------------------------------------------------------------------

	/**
	 * @property watcher
	 * @since 0.1.0
	 * @hidden
	 */
	private watcher: any

	/**
	 * @property watcher
	 * @since 0.1.0
	 * @hidden
	 */
	private bundles: Dictionary<string> = {}

	/**
	 * @property ready
	 * @since 0.1.0
	 * @hidden
	 */
	private ready: boolean = false
}
