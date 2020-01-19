import address from 'internal-ip'

/**
 * @function getDefaultServerHost
 * @since 0.1.0
 */
export async function getDefaultServerHost(defaultHost?: string) {

	if (defaultHost) {
		return defaultHost
	}

	let host = await address.v4()
	if (host == null) {
		host = 'localhost'
	}

	return host
}
