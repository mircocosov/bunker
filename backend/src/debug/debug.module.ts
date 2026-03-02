import { Module } from '@nestjs/common';
import { DebugController } from './debug.controller';
import { DebugGuard } from './debug.guard';
import { TwitchModule } from '../twitch/twitch.module';

@Module({
  imports: [TwitchModule],
  controllers: [DebugController],
  providers: [DebugGuard]
})
export class DebugModule {}
