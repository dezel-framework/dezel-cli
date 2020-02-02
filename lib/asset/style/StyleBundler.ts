import { Bundler } from '../../bundler/Bundler'
import { AssetBundler } from '../AssetBundler'

/**
 * @class AssetBundler
 * @since 0.1.0
 */
export class StyleBundler extends AssetBundler {

	/**
	 * @inherited
	 * @method handle
	 * @since 0.1.0
	 */
	public handle(file: string) {
		return (
			file.match(/\.style$/) != null ||
			file.match(/\.style\.ios$/) != null ||
			file.match(/\.style\.android$/) != null
		)
	}

	/**
	 * @inherited
	 * @method bundle
	 * @since 0.1.0
	 */
	public bundle(file: string, data: string, bundles: Dictionary<string>, bundler: Bundler) {

		let name = bundler.outputName

		if (bundles[name + '.style.ios'] == null) {
			bundles[name + '.style.ios'] = ''
		}

		if (bundles[name + '.style.android'] == null) {
			bundles[name + '.style.android'] = ''
		}

		let match = file.match(/\.style(\.([ios|android]+))?$/)
		if (match == null) {
			return
		}

		if (match[2] == null) {
			bundles[name + '.style.ios'] += data + '\n'
			bundles[name + '.style.android'] += data + '\n'
			return
		}

		if (match[2] == 'ios') {
			bundles[name + '.style.ios'] += data + '\n'
			return
		}

		if (match[2] == 'android') {
			bundles[name + '.style.android'] += data + '\n'
			return
		}
	}
}