import path from 'path'
import { Command } from '../lib/command/Command'
import { DevelopmentServer } from '../lib/server/DevelopmentServer'

/**
 * @class Watch
 * @since 0.1.0
 */
export default class Watch extends Command {

	/**
	 * @inherited
	 * @method execute
	 * @since 0.1.0
	 */
	public async execute(options: any) {

		if (options.file) {
			options.file = path.join(process.cwd(), options.file)
		} else {
			options.file = path.join(process.cwd(), '/src/index.ts')
		}

		new DevelopmentServer({
			file: options.file,
			host: options.host,
			port: options.port,
			publicPath: options.publicPath || '/',
			outputName: options.outputName || 'app'
		})

		return null
	}

}