import chalk from 'chalk'
import fs from 'fs'
import ora from 'ora'
import path from 'path'
import through from 'through2'
import tinyify from 'tinyify'
import tsify from 'tsify'
import browserify, { BrowserifyObject } from 'browserify'
import { EventEmitter } from 'events'
import { StyleBundler } from '../asset/style/StyleBundler'
import { AssetManager } from '../asset/AssetManager'

/**
 * @interface BundlerOptions
 * @since 0.1.0
 */
export interface BundlerOptions {
	file: string
	outputPath: string
	outputName: string
	minify: boolean
	includes?: Array<string>
	variables?: any
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
	 * @property file
	 * @since 0.1.0
	 */
	public file: string

	/**
	 * @property outputPath
	 * @since 0.1.0
	 */
	public outputPath: string

	/**
	 * @property outputName
	 * @since 0.1.0
	 */
	public outputName: string

	/**
	 * @property minify
	 * @since 0.1.0
	 */
	public minify: boolean

	//--------------------------------------------------------------------------
	// Methods
	//--------------------------------------------------------------------------

	/**
	 * @constructor
	 * @since 0.1.0
	 */
	constructor(options: BundlerOptions) {

		super()

		this.file = options.file
		this.outputPath = options.outputPath
		this.outputName = options.outputName
		this.minify = options.minify

		let opts = {
			debug: options.minify == false,
			cache: {},
			packageCache: {},
			insertGlobalVars: {
				...options.variables
			}
		}

		let transformer = (file: string) => {

			let result = this.onTransform(file)
			if (result == null) {
				result = through()
			}

			return result
		}

		this.bundler = browserify(options.file, opts)
		this.bundler.transform(transformer, { global: true })
		this.bundler.plugin(tsify)

		if (options.minify) {
			this.bundler.plugin(tinyify)
		}

		let includes = options.includes
		if (includes) {
			includes.forEach(file => this.bundler.add(file))
		}

		this.assets = new AssetManager({
			bundlers: [
				new StyleBundler
			]
		})
	}

	/**
	 * @method bundle
	 * @since 0.1.0
	 */
	public bundle() {

		console.log('')
		console.log(' -> Input file:  ' + chalk.blue(this.file))
		console.log(' -> Output path: ' + chalk.blue(this.outputPath))
		console.log(' -> Output name: ' + chalk.blue(this.outputName))
		console.log(' -> Minify       ' + chalk.blue(this.minify ? 'Yes' : 'No'))
		console.log('')

		let writer = this.createWriteStream(
			path.join(
				this.outputPath,
				this.outputName + '.js'
			)
		)

		this.bundler.bundle().pipe(writer).on('finish', () => {
			this.assets.output(this, name => this.createWriteStream(path.join(this.outputPath, name)))
		})
	}

	//--------------------------------------------------------------------------
	// Events
	//--------------------------------------------------------------------------

	/**
	 * @method onTransform
	 * @since 0.1.0
	 * @hidden
	 */
	protected onTransform(file: string) {

		let handle = this.assets.handle(file)
		if (handle == false) {
			return null
		}

		return through(

			(data, enc, next) => {
				this.assets.append(file, data)
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
	protected assets: AssetManager

	/**
	 * @property bundler
	 * @since 0.1.0
	 * @hidden
	 */
	protected bundler: BrowserifyObject

	/**
	 * @method createWriteStream
	 * @since 0.1.0
	 * @hidden
	 */
	private createWriteStream(file: string) {
		return fs.createWriteStream(file).on('finish', () => console.log(chalk.green('Updated: ' + file)))
	}
}
