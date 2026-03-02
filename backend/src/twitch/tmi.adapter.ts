import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import tmi from 'tmi.js';
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
    client.on('message', async (_, tags, message) => {
      const senderNick = tags['display-name'] || tags.username || '';
      for (const h of this.handlers) await h({ senderNick, message });
    });
    await client.connect();
    this.logger.log(`Anonymous listener connected to #${channel}`);
  }
}
