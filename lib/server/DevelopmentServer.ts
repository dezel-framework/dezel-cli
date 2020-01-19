import chalk from 'chalk'
import path from 'path'
import http, { Server } from 'http'
import { setFlagsFromString } from 'v8'
import { Server as WebSocketServer } from 'ws'
import { getDefaultServerHost } from './network/getDefaultServerHost'
import { getDefaultServerPort } from './network/getDefaultServerPort'
import { Bundler } from './bundler/Bundler'
import { BundlerOptions } from './bundler/Bundler'

/**
 * @interface DevelopmentServerOptions
 * @since 0.1.0
 */
export interface DevelopmentServerOptions {
	host?: string
	port?: number
	file: string
	publicPath: string
	outputName: string
}

/**
 * @class DevelopmentServer
 * @since 0.1.0
 */
export class DevelopmentServer {

	//--------------------------------------------------------------------------
	// Properties
	//--------------------------------------------------------------------------

	/**
	 * @property file
	 * @since 0.1.0
	 */
	public file: string

	/**
	 * @property assets
	 * @since 0.1.0
	 */
	public host: string

	/**
	 * @property port
	 * @since 0.1.0
	 */
	public port: number

	/**
	 * @property publicPath
	 * @since 0.1.0
	 */
	public publicPath: string

	/**
	 * @property outputName
	 * @since 0.1.0
	 */
	public outputName: string

	//--------------------------------------------------------------------------
	// Methods
	//--------------------------------------------------------------------------

	/**
	 * @constructor
	 * @since 1.0.0
	 */
	constructor(options: DevelopmentServerOptions) {

		this.file = options.file
		this.publicPath = options.publicPath
		this.outputName = options.outputName

		let port = options.port || 8080
		let host = options.host

		Promise.all([

			getDefaultServerHost(host),
			getDefaultServerPort(port)

		]).then(([defaultHost, defaultPort]) => {

			this.host = defaultHost
			this.port = defaultPort

			let options: BundlerOptions = {
				includes: [
					path.join(__dirname, 'reload/client.js')
				]
			}

			this.bundler = new Bundler(this, options)
			this.bundler.on('update', this.onBundlerUpdate.bind(this))
			this.bundler.on('error', this.onBundlerError.bind(this))

			this.start()
		})
	}

	//--------------------------------------------------------------------------
	// Private API
	//--------------------------------------------------------------------------

	/**
	 * @private server
	 * @since 0.1.0
	 * @hidden
	 */
	private server: Server

	/**
	 * @private socket
	 * @since 0.1.0
	 * @hidden
	 */
	private socket: WebSocketServer

	/**
	 * @private bundler
	 * @since 0.1.0
	 * @hidden
	 */
	private bundler: Bundler

	/**
	 * @method start
	 * @since 0.1.0
	 * @hidden
	 */
	private async start() {

		this.server = http.createServer((req: Request, res: Response) => {
			this.bundler.resolve(req, res)
		})

		this.server.listen(
			this.port,
			this.host,
			() => {

				console.log(chalk.green('Dezel development server started'))
				console.log(' -> Input file:  ' + chalk.blue(this.file))
				console.log(' -> Host:        ' + chalk.blue(this.host))
				console.log(' -> Port:        ' + chalk.blue(this.port))
				console.log(' -> Public path: ' + chalk.blue(this.publicPath))
				console.log(' -> Output name: ' + chalk.blue(this.outputName))
				console.log('')

			}
		)

		this.socket = new WebSocketServer({ server: this.server, perMessageDeflate: false })
	}

	/**
	 * @method reload
	 * @since 0.1.0
	 * @hidden
	 */
	private reload(type: 'scripts' | 'styles', message: string) {

		let action: string

		switch (type) {

			case 'scripts':
				action = 'reload'
				break

			case 'styles':
				action = 'reload-styles'
				break

			default:
				throw new Error('Unexpected error.')
		}

		console.log(chalk.blue(' -> ' + message))

		try {

			let data = JSON.stringify({ action })

			this.socket.clients.forEach(client => {
				client.send(data, { binary: false })
			})

		} catch (err) {
			console.error('Error sending reload message to the client:')
			console.error(err)
		}
	}

	/**
	 * @method onBundlerUpdate
	 * @since 0.1.0
	 * @hidden
	 */
	private onBundlerUpdate(files: Array<string>) {

		console.log(chalk.green('Bundle updated:'))
		console.log(
			files.map(file => chalk.red(' -> ') + file).join('\n')
		)

		let styles = files.every(file =>
			file.match(/\.style$/) ||
			file.match(/\.style\.ios$/) ||
			file.match(/\.style\.android$/)
		)

		if (styles) {
			this.reload('styles', 'Reloading styles')
			return
		}

		this.reload('scripts', 'Reloading')
	}

	/**
	 * @method onBundlerError
	 * @since 0.1.0
	 * @hidden
	 */
	private onBundlerError(error: Error) {
		console.error(chalk.red(error.stack || error.message || error))
	}
}