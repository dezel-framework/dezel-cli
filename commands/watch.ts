import { isUndefined } from 'util'
import { Command } from '../lib/command/Command'
import { DevelopmentServer } from '../lib/server/DevelopmentServer'
import { DevelopmentServerOptions } from '../lib/server/DevelopmentServer'

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

		new DevelopmentServer({
			file: options.file || process.cwd() + '/src/index.ts',
			host: options.host,
			port: options.port,
			publicPath: options.publicPath || '/',
			outputName: options.outputName || 'app'
		})

		return null
	}

}