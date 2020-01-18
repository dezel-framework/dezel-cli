import getPort from 'get-port'

/**
 * @function getDefaultServerPort
 * @since 0.1.0
 */
export async function getDefaultServerPort(port: number) {
	return getPort({ port })
}