import { Injectable, Logger } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import * as tmi from "tmi.js"
import { ChatUserstate, Client } from "tmi.js"
import {
	ChatMessage,
	TwitchChatAdapter,
	TwitchDebugState,
} from "./twitch.adapter"

@Injectable()
export class TmiChatAdapter implements TwitchChatAdapter {
	private readonly logger = new Logger(TmiChatAdapter.name)
	private handlers: Array<(msg: ChatMessage) => Promise<void> | void> = []
	private client: Client | null = null
	private channel: string | null = null
	private connected = false
	private lastMessageAt: string | null = null
	private lastSenderNick: string | null = null

	constructor(private cfg: ConfigService) {}

	onMessage(handler: (msg: ChatMessage) => Promise<void> | void): void {
		this.handlers.push(handler)
	}

	async connectAndListen(): Promise<void> {
		const rawChannel = this.cfg.get<string>("TWITCH_CHANNEL") ?? ""
		const channel = rawChannel.trim().replace(/^#/, "")
		this.channel = channel || null
		this.logger.log(
			`[Twitch] starting... channel=${this.channel ?? "(empty)"}`,
		)
		if (!channel) return

		const client = new tmi.Client({
			channels: [channel],
			connection: { reconnect: true, secure: true },
		})
		client.on("connected", () => {
			this.connected = true
			this.logger.log("[Twitch] connected")
		})
		client.on(
			"join",
			(joinedChannel: string, username: string, self: boolean) => {
				if (!self) return
				this.logger.log(
					`[Twitch] joined channel=${joinedChannel} user=${username}`,
				)
			},
		)
		client.on(
			"message",
			async (
				channelName: string,
				tags: ChatUserstate,
				message: string,
				self: boolean,
			) => {
				if (self) return
				const senderNick = (
					tags.username ??
					tags["display-name"] ??
					""
				).toString()
				const text = message.trim()
				this.lastMessageAt = new Date().toISOString()
				this.lastSenderNick = senderNick
				this.logger.log(
					`[Twitch] message sender=${senderNick} text=${text}`,
				)
				for (const h of this.handlers)
					await h({ senderNick, message: text })
				void channelName
			},
		)

		this.client = client
		await client.connect()
	}

	async disconnect(): Promise<void> {
		if (!this.client) return
		await this.client.disconnect()
		this.client = null
		this.connected = false
	}

	getDebugState(): TwitchDebugState {
		return {
			channel: this.channel,
			connected: this.connected,
			lastMessageAt: this.lastMessageAt,
			lastSenderNick: this.lastSenderNick,
		}
	}
}
