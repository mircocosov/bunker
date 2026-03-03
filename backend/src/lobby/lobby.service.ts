import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class LobbyService {
  constructor(private prisma: PrismaService) {}

  async create(settings: { playersLimit: number; voteTimerSec: number; revealTimerSec: number; initialRevealedCount: number; apocalypseTypeId?: string; bunkerLocationTypeId?: string }) {
    const existing = await this.prisma.lobby.findFirst({ where: { isActive: true } });
    if (existing) return existing;
    return this.prisma.lobby.create({ data: { ...settings, isActive: true, phase: 'REVEAL' } });
  }

  current() {
    return this.prisma.lobby.findFirst({ where: { isActive: true }, include: { players: true } });
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
