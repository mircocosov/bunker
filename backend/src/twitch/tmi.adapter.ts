import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import tmi, { ChatUserstate } from 'tmi.js';
import { ChatMessage, TwitchChatAdapter } from './twitch.adapter';

@Injectable()
export class TmiChatAdapter implements TwitchChatAdapter {
  private readonly logger = new Logger(TmiChatAdapter.name);
  private handlers: Array<(msg: ChatMessage) => Promise<void> | void> = [];

  constructor(private cfg: ConfigService) {}

  onMessage(handler: (msg: ChatMessage) => Promise<void> | void): void {
    this.handlers.push(handler);
  }

  async start(): Promise<void> {
    const channel = this.cfg.get<string>('TWITCH_CHANNEL');
    if (!channel) return;
    const client = new tmi.Client({ channels: [channel], connection: { reconnect: true, secure: true } });
    client.on(
      'message',
      async (channelName: string, tags: ChatUserstate, message: string, self: boolean) => {
        if (self) return;
        const senderNick = (tags.username ?? tags['display-name'] ?? '').toString();
        for (const h of this.handlers) await h({ senderNick, message });
        void channelName;
      },
    );
    await client.connect();
    this.logger.log(`Anonymous listener connected to #${channel}`);
  }
}
