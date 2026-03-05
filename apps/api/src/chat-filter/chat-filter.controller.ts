import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ChatFilterService } from './chat-filter.service';

class UpsertFilterDto {
  pattern!: string;
}

class MaskTextDto {
  text!: string;
}

@Controller('admin/chat-filter')
export class ChatFilterController {
  constructor(private readonly chatFilterService: ChatFilterService) {}

  @Get()
  list() {
    return this.chatFilterService.list();
  }

  @Post()
  create(@Body() body: UpsertFilterDto) {
    return this.chatFilterService.create(body.pattern);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: UpsertFilterDto) {
    return this.chatFilterService.update(id, body.pattern);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    this.chatFilterService.remove(id);
    return { deleted: true };
  }

  @Post('mask-preview')
  preview(@Body() body: MaskTextDto) {
    return { masked: this.chatFilterService.maskText(body.text) };
  }
}
