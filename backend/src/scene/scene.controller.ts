import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AdminGuard, JwtAuthGuard } from '../auth/guards';
import { PrismaService } from '../prisma.service';

@Controller('scene')
export class SceneController {
  constructor(private prisma: PrismaService) {}

  @Get('presets')
  list() {
    return this.prisma.scenePreset.findMany({ include: { layers: true } });
  }

  @Post('presets')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  create(@Body() body: any) {
    return this.prisma.scenePreset.create({
      data: {
        apocalypseTypeId: body.apocalypseTypeId,
        bunkerLocationTypeId: body.bunkerLocationTypeId,
        groundYPercent: body.groundYPercent,
        layers: { create: body.layers || [] }
      },
      include: { layers: true }
    });
  }
}
