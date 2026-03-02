import { Body, Controller, Get, HttpCode, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { ConfirmAuthDto, RequestCodeDto } from './dto';
import { JwtAuthGuard } from './guards';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('request-code')
  requestCode(@Body() dto: RequestCodeDto) {
    return this.auth.requestCode(dto.twitchNick);
  }


  @Post('confirm')
  @HttpCode(200)
  async confirm(@Body() dto: ConfirmAuthDto, @Res({ passthrough: true }) res: { status: (code: number) => unknown }) {
    const confirmed = await this.auth.confirm(dto.twitchNick);
    if (!confirmed) {
      res.status(204);
      return;
    }
    return confirmed;
  }

  @Get('/me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  me(@Req() req: { user: { userId: string } }) {
    return this.auth.me(req.user.userId);
  }
}
