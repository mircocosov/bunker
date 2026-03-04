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
  gameRulesId?: string;
};

@Injectable()
export class LobbyService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService
  ) {}

  async create(settings: LobbySettingsInput) {
    return this.prisma.$transaction(async (tx: any) => {
      const existing = await tx.lobby.findFirst({ where: { isActive: true } });
      if (existing) return existing;

      const defaultRules = await tx.gameRules.findUnique({ where: { key: 'bunker_classic' } });
      const selectedRules = settings.gameRulesId
        ? await tx.gameRules.findUnique({ where: { id: settings.gameRulesId } })
        : defaultRules;

      if (settings.gameRulesId && !selectedRules) {
        throw new BadRequestException('Указанный набор правил не найден');
      }

      const voteTimerSec = settings.voteTimerSec
        ?? selectedRules?.votingDurationSec
        ?? Number(this.configService.get('VOTING_DURATION_SECONDS') ?? 60);
      const revealTimerSec = settings.revealTimerSec
        ?? selectedRules?.openCharacteristicDurationSec
        ?? Number(this.configService.get('OPEN_CHARACTERISTIC_DURATION_SECONDS') ?? 30);
      const initialRevealedCount = settings.initialRevealedCount ?? selectedRules?.initialRevealedCount ?? 1;
      const playersLimit = settings.playersLimit || selectedRules?.bunkerCapacity || 8;

      return tx.lobby.create({
        data: {
          playersLimit,
          voteTimerSec,
          revealTimerSec,
          initialRevealedCount,
          gameRulesId: selectedRules?.id,
          apocalypseTypeId: settings.apocalypseTypeId,
          bunkerLocationTypeId: settings.bunkerLocationTypeId,
          isActive: true,
          phase: 'REVEAL'
        }
      });
    });
  }

  current() {
    return this.prisma.lobby.findFirst({ where: { isActive: true }, include: { players: { include: { user: true } }, gameRules: true } });
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
