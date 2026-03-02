declare module "tmi.js" {
	export type ChatUserstate = {
		username?: string
		"display-name"?: string
		[key: string]: any
	}

	export type Options = {
		options?: { debug?: boolean }
		connection?: { reconnect?: boolean; secure?: boolean }
		channels?: string[]
		identity?: { username: string; password: string }
	}

	export class Client {
		constructor(opts: Options)
		connect(): Promise<void>
		disconnect(): Promise<void>
		on(
			event: "connected",
			cb: (address: string, port: number) => void | Promise<void>,
		): void
		on(
			event: "join",
			cb: (
				channel: string,
				username: string,
				self: boolean,
			) => void | Promise<void>,
		): void
		on(
			event: "message",
			cb: (
				channel: string,
				tags: ChatUserstate,
				message: string,
				self: boolean,
			) => void | Promise<void>,
		): void
	}
}
