import program from 'commander'
import { Command } from './lib/command/Command'

/**
 * @function cli
 * @since 0.1.0
 */
export function cli(args: Array<string>) {

	program.version('0.1.0')

	/**
	 * @command watch
	 * @since 0.1.0
	 */
	program
		.command('watch')
		.option('-f, --file [file]', 'The main TS file, defaults to src/index.ts')
		.option('-h, --host [host]', 'The development server host, defaults to the local IP.')
		.option('-p, --port [port]', 'The development server port, defaults to 8080.')
		.option('--public-path [publicPath]', 'The path that the assets will be served at, defaults to /')
		.option('--output-name [outputName]', 'The name that will prefix outputed file, defaults to app')
		.action((options) => {
			run('./commands/watch', options)
		})

	if (args.length) {
		program.parse(args)
	} else {
		program.outputHelpInformation()
	}
}

/**
 * @function run
 * @since 0.1.0
 */
async function run(path: string, options: any) {

	let constructor = require(path).default
	if (constructor == null) {
		throw new Error('Cannot run command at path ' + path)
	}

	let instance = new constructor() as Command
	await instance.execute(options)
	await instance.cleanup()
}