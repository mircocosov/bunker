import { Module } from '@nestjs/common';
import { TmiChatAdapter } from './tmi.adapter';
import { TWITCH_ADAPTER } from './twitch.adapter';
import { TwitchListenerService } from './twitch.listener';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [TmiChatAdapter, TwitchListenerService, { provide: TWITCH_ADAPTER, useExisting: TmiChatAdapter }],
  exports: [TWITCH_ADAPTER]
})
export class TwitchModule {}
