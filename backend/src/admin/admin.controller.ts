import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminGuard, JwtAuthGuard } from '../auth/guards';
import { AdminService } from './admin.service';

@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth()
export class AdminController {
  constructor(private admin: AdminService) {}

  @Post('kick')
  kick(@Body('userId') userId: string) {
    return this.admin.kick(userId);
  }

  @Post('ban')
  ban(@Body('twitchNick') twitchNick: string) {
    return this.admin.ban(twitchNick);
  }

  @Post('unban')
  unban(@Body('twitchNick') twitchNick: string) {
    return this.admin.unban(twitchNick);
  }

  @Get('bans')
  bans(@Query('search') search?: string) {
    return this.admin.bans(search);
  }
}
