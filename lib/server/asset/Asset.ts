/**
 * @enum AssetType
 * @since 0.1.0
 */
export enum AssetType {
	NONE,
	STYLE,
	STYLE_IOS,
	STYLE_ANDROID
}

/**
 * @enum Asset
 * @since 0.1.0
 */
export class Asset {

	//--------------------------------------------------------------------------
	// Properties
	//--------------------------------------------------------------------------

	/**
	 * @property data
	 * @since 0.1.0
	 */
	public data: string = ''

	/**
	 * @property file
	 * @since 0.1.0
	 */
	public file: string

	/**
	 * @property type
	 * @since 0.1.0
	 */
	public type: AssetType = AssetType.NONE

	/**
	 * @property kind
	 * @since 0.1.0
	 */
	public kind: string = ''

	/**
	 * @property extn
	 * @since 0.1.0
	 */
	public rule: string = ''

	//--------------------------------------------------------------------------
	// Methods
	//--------------------------------------------------------------------------

	/**
	 * @constructor
	 * @since 1.0.0
	 */
	constructor(file: string) {

		this.file = file

		let match = this.parse(file)
		if (match == null) {
			return
		}

		this.type = AssetType.STYLE
		this.kind = 'any'
		this.rule = 'any'

		switch (match[2]) {

			case 'ios':
				this.type = AssetType.STYLE_IOS
				this.kind = 'style.ios'
				this.rule = 'ios'
				break

			case 'android':
				this.type = AssetType.STYLE_ANDROID
				this.kind = 'style.android'
				this.rule = 'android'
				break
		}
	}

	//--------------------------------------------------------------------------
	// Private API
	//--------------------------------------------------------------------------

	/**
	 * @method parse
	 * @since 1.0.0
	 * @hidden
	 */
	private parse(file: string) {
		return file.match(/\.style(\.([ios|android]+))?$/)
	}
}