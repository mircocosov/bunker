import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma.service';

type LobbySettingsInput = {
  playersLimit: number;
  voteTimerSec?: number;
  revealTimerSec?: number;
  initialRevealedCount?: number;
  apocalypseTypeId?: string;
  bunkerLocationTypeId?: string;
};

@Injectable()
export class LobbyService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService
  ) {}

  async create(settings: LobbySettingsInput) {
    const existing = await this.prisma.lobby.findFirst({ where: { isActive: true } });
    if (existing) return existing;

    const voteTimerSec = settings.voteTimerSec ?? Number(this.configService.get('VOTING_DURATION_SECONDS') ?? 60);
    const revealTimerSec = settings.revealTimerSec ?? Number(this.configService.get('OPEN_CHARACTERISTIC_DURATION_SECONDS') ?? 30);
    const initialRevealedCount = settings.initialRevealedCount ?? 1;

    return this.prisma.lobby.create({
      data: {
        playersLimit: settings.playersLimit,
        voteTimerSec,
        revealTimerSec,
        initialRevealedCount,
        apocalypseTypeId: settings.apocalypseTypeId,
        bunkerLocationTypeId: settings.bunkerLocationTypeId,
        isActive: true,
        phase: 'REVEAL'
      }
    });
  }

  current() {
    return this.prisma.lobby.findFirst({ where: { isActive: true }, include: { players: { include: { user: true } } } });
  }

  async register(userId: string) {
    const lobby = await this.prisma.lobby.findFirst({ where: { isActive: true }, include: { players: true } });
    if (!lobby) throw new BadRequestException('No active lobby');
    const activePlayers = lobby.players.filter((p: { status: string }) => p.status === 'ALIVE').length;
    if (activePlayers >= lobby.playersLimit) throw new BadRequestException('Lobby full');
    return this.prisma.lobbyPlayer.upsert({
      where: { lobbyId_userId: { lobbyId: lobby.id, userId } },
      update: { status: 'ALIVE' },
      create: { lobbyId: lobby.id, userId, status: 'ALIVE' }
    });
  }
}
