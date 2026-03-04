import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminGuard, JwtAuthGuard } from '../auth/guards';
import { CreateLobbyDto } from './dto';
import { LobbyService } from './lobby.service';

@ApiTags('lobby')
@Controller('lobby')
export class LobbyController {
  constructor(private lobby: LobbyService) {}

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  create(@Body() body: CreateLobbyDto) {
    return this.lobby.create(body);
  }

  @Get()
  getCurrent() {
    return this.lobby.current();
  }

  @Post('register')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  register(@Req() req: { user: { userId: string } }) {
    return this.lobby.register(req.user.userId);
  }
}
