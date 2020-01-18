declare module 'tsify'
declare module 'watchify'
declare module 'watchify-middleware'
declare module 'stacked'

type Request = import('http').IncomingMessage
type Response = import('http').ServerResponse

interface Dictionary<T> {
	[index: string]: T;
}
