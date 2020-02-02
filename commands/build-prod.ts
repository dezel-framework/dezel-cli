import path from 'path'
import { Bundler } from '../lib/bundler/Bundler'
import { Command } from '../lib/command/Command'

/**
 * @class Build
 * @since 0.1.0
 */
export default class Build extends Command {

	/**
	 * @inherited
	 * @method execute
	 * @since 0.1.0
	 */
	public async execute(options: any) {

		let {
			file,
			outputPath,
			outputName
		} = options

		if (file) {
			file = path.join(process.cwd(), file)
		} else {
			file = path.join(process.cwd(), '/src/index.ts')
		}

		if (outputPath) {
			outputPath = path.join(process.cwd(), outputPath)
		} else {
			outputPath = path.join(process.cwd(), 'app')
		}

		if (outputName == null) {
			outputName = 'app'
		}

		let bundler = new Bundler({
			file,
			outputPath,
			outputName,
			minify: true
		})

		bundler.bundle()

		return null
	}

}