import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { TWITCH_ADAPTER, TwitchChatAdapter } from './twitch.adapter';

@Injectable()
export class TwitchListener implements OnModuleInit {
  constructor(@Inject(TWITCH_ADAPTER) private adapter: TwitchChatAdapter, private auth: AuthService) {}

  async onModuleInit() {
    this.adapter.onMessage(async ({ senderNick, message }) => {
      await this.auth.verifyByChat(senderNick, message);
    });
    await this.adapter.start();
  }
}
