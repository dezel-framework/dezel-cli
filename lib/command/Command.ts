/**
 * @class Command
 * @since 0.1.0
 */
export abstract class Command {

	/**
	 * @method execute
	 * @param args
	 */
	public async execute(args: any) {
		return null
	}

	/**
	 * @method execute
	 * @param args
	 */
	public async cleanup() {

	}

}