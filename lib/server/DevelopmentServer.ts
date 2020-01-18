import chalk from 'chalk'
import path from 'path'
import http, { Server } from 'http'
import { Server as WebSocketServer } from 'ws'
import { getDefaultServerHost } from './network/getDefaultServerHost'
import { getDefaultServerPort } from './network/getDefaultServerPort'
import { Bundler } from './bundler/Bundler'

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
	 * @constructors
	 * @since 1.0.0
	 */
	constructor(options: DevelopmentServerOptions) {

		this.file = options.file
		this.publicPath = options.publicPath
		this.outputName = options.outputName

		let port = options.port
		let host = options.host

		Promise.all([

			getDefaultServerHost(),
			getDefaultServerPort(8080)

		]).then(([defaultHost, defaultPort]) => {

			this.host = host || defaultHost
			this.port = defaultPort

			let client = path.join(__dirname, 'reload/client.js')

			this.bundler = new Bundler(this, [client])
			this.bundler.on('update', this.onBundleUpdate.bind(this))

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
				console.log(' -> File:        ' + chalk.blue(this.file))
				console.log(' -> Host:        ' + chalk.blue(this.host))
				console.log(' -> Port:        ' + chalk.blue(this.port))
				console.log(' -> Public path: ' + chalk.blue(this.publicPath))
				console.log(' -> Output name: ' + chalk.blue(this.outputName))

			}
		)

		this.socket = new WebSocketServer({ server: this.server, perMessageDeflate: false })
	}

	/**
	 * @method send
	 * @since 0.1.0
	 * @hidden
	 */
	private send(data: object) {

		let string = JSON.stringify(data)

		try {

			this.socket.clients.forEach(client => {
				if (client.readyState === client.OPEN) {
					client.send(string, { binary: false })
				}
			})

		} catch (err) {
			console.error('Error sending LiveReload event to client:')
			console.error(err)
		}
	}

	/**
	 * @method onBundleUpdate
	 * @since 0.1.0
	 * @hidden
	 */
	private onBundleUpdate(files: Array<string>) {

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
			console.log(chalk.blue(' -> Reloading styles...'))
			this.send({ action: 'reload-styles' })
		} else {
			console.log(chalk.blue(' -> Reloading...'))
			this.send({ action: 'reload' })
		}
	}
}