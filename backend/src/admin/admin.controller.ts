import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminGuard, JwtAuthGuard } from '../auth/guards';
import { BanUserDto, FilterWordDto, PoolItemDto } from './dto';
import { AdminService, PoolType } from './admin.service';

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
  ban(@Body() body: BanUserDto) {
    return this.admin.ban(body.twitchNick);
  }

  @Delete('bans/:id')
  unban(@Param('id') id: string) {
    return this.admin.unbanById(id);
  }

  @Get('bans')
  bans(@Query('search') search?: string) {
    return this.admin.bans(search);
  }

  @Get('chat-filter')
  listFilterWords() {
    return this.admin.listFilterWords();
  }

  @Post('chat-filter')
  addFilterWord(@Body() body: FilterWordDto) {
    return this.admin.addFilterWord(body.word);
  }

  @Patch('chat-filter/:id')
  updateFilterWord(@Param('id') id: string, @Body() body: FilterWordDto) {
    return this.admin.updateFilterWord(id, body.word);
  }

  @Delete('chat-filter/:id')
  deleteFilterWord(@Param('id') id: string) {
    return this.admin.deleteFilterWord(id);
  }

  @Get('pools/:type')
  listPool(@Param('type') type: PoolType) {
    return this.admin.listPool(type);
  }

  @Post('pools/:type')
  createPoolItem(@Param('type') type: PoolType, @Body() payload: PoolItemDto) {
    return this.admin.createPoolItem(type, payload);
  }

  @Patch('pools/:type/:id')
  updatePoolItem(@Param('type') type: PoolType, @Param('id') id: string, @Body() payload: PoolItemDto) {
    return this.admin.updatePoolItem(type, id, payload);
  }

  @Delete('pools/:type/:id')
  deletePoolItem(@Param('type') type: PoolType, @Param('id') id: string) {
    return this.admin.deletePoolItem(type, id);
  }
}
