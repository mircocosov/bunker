import { Body, Controller, Delete, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AdminGuard, JwtAuthGuard } from '../auth/guards';
import { PrismaService } from '../prisma.service';

@Controller('chat-filter')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth()
export class ChatFilterController {
  constructor(private prisma: PrismaService) {}

  @Get()
  list() { return this.prisma.chatFilterWord.findMany(); }

  @Post()
  create(@Body('word') word: string) { return this.prisma.chatFilterWord.create({ data: { word } }); }

  @Delete()
  remove(@Body('id') id: string) { return this.prisma.chatFilterWord.delete({ where: { id } }); }
}
