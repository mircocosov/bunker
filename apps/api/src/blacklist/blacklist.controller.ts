import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { BlacklistService } from './blacklist.service';

class UpsertBlacklistDto {
  nickname!: string;
  reason?: string;
}

@Controller('admin/blacklist')
export class BlacklistController {
  constructor(private readonly blacklistService: BlacklistService) {}

  @Get()
  list() {
    return this.blacklistService.list();
  }

  @Post()
  create(@Body() body: UpsertBlacklistDto) {
    return this.blacklistService.create(body);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: UpsertBlacklistDto) {
    return this.blacklistService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    this.blacklistService.remove(id);
    return { deleted: true };
  }
}
