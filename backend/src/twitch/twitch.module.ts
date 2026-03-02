import { Module } from '@nestjs/common';
import { TmiChatAdapter } from './tmi.adapter';
import { TWITCH_ADAPTER } from './twitch.adapter';

@Module({
  providers: [TmiChatAdapter, { provide: TWITCH_ADAPTER, useExisting: TmiChatAdapter }],
  exports: [TWITCH_ADAPTER]
})
export class TwitchModule {}
