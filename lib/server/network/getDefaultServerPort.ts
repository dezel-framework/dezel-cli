import getPort from 'get-port'

/**
 * @function getDefaultServerPort
 * @since 0.1.0
 */
export async function getDefaultServerPort(defaultPort: number) {
	return getPort({ port: defaultPort })
}