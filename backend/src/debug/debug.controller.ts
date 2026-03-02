import { Controller, Get, Inject, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards';
import { TWITCH_ADAPTER, TwitchChatAdapter } from '../twitch/twitch.adapter';
import { DebugGuard } from './debug.guard';

@ApiTags('debug')
@Controller('debug')
export class DebugController {
  constructor(@Inject(TWITCH_ADAPTER) private twitch: TwitchChatAdapter) {}

  @Get('twitch')
  @UseGuards(JwtAuthGuard, DebugGuard)
  @ApiBearerAuth()
  twitchState() {
    return this.twitch.getDebugState();
  }
}
