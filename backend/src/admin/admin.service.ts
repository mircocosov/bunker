import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

const poolMap = {
  professions: 'profession',
  phobias: 'phobia',
  hobbies: 'hobby',
  luggage: 'luggage',
  facts: 'fact',
  health: 'health',
  actionCards: 'actionCard',
  apocalypseTypes: 'apocalypseType',
  bunkerLocations: 'bunkerLocationType'
} as const;

export type PoolType = keyof typeof poolMap;

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  kick(userId: string) {
    return this.prisma.lobbyPlayer.updateMany({ data: { status: 'SPECTATOR' }, where: { userId, lobby: { isActive: true } } });
  }

  ban(twitchNick: string) {
    return this.prisma.bannedUser.upsert({ where: { twitchNick }, update: {}, create: { twitchNick } });
  }

  unbanById(id: string) {
    return this.prisma.bannedUser.delete({ where: { id } });
  }

  bans(search?: string) {
    return this.prisma.bannedUser.findMany({ where: search ? { twitchNick: { contains: search, mode: 'insensitive' } } : {}, orderBy: { createdAt: 'desc' } });
  }

  listFilterWords() {
    return this.prisma.chatFilterWord.findMany({ orderBy: { word: 'asc' } });
  }

  addFilterWord(word: string) {
    return this.prisma.chatFilterWord.create({ data: { word } });
  }

  updateFilterWord(id: string, word: string) {
    return this.prisma.chatFilterWord.update({ where: { id }, data: { word } });
  }

  deleteFilterWord(id: string) {
    return this.prisma.chatFilterWord.delete({ where: { id } });
  }

  listPool(type: PoolType) {
    const delegate = this.poolDelegate(type);
    return delegate.findMany({ orderBy: this.poolOrderBy(type) });
  }

  createPoolItem(type: PoolType, payload: Record<string, any>) {
    const delegate = this.poolDelegate(type);
    return delegate.create({ data: this.normalizePoolPayload(type, payload) });
  }

  updatePoolItem(type: PoolType, id: string, payload: Record<string, any>) {
    const delegate = this.poolDelegate(type);
    return delegate.update({ where: { id }, data: this.normalizePoolPayload(type, payload) });
  }

  deletePoolItem(type: PoolType, id: string) {
    const delegate = this.poolDelegate(type);
    return delegate.delete({ where: { id } });
  }

  private poolDelegate(type: PoolType): any {
    const key = poolMap[type];
    return (this.prisma as any)[key];
  }

  private poolOrderBy(type: PoolType): Record<string, 'asc'> {
    if (type === 'apocalypseTypes' || type === 'bunkerLocations') {
      return { name: 'asc' };
    }
    if (type === 'actionCards') {
      return { type: 'asc' };
    }
    return { value: 'asc' };
  }

  private normalizePoolPayload(type: PoolType, payload: Record<string, any>): Record<string, any> {
    if (type === 'actionCards') {
      return {
        type: payload.type,
        changeField: payload.changeField || null,
        targetField: payload.targetField || null,
        upgradeText: payload.upgradeText || null
      };
    }

    if (type === 'health') {
      const normalizedSeverity = typeof payload.severity === 'boolean'
        ? (payload.severity ? 'severe' : null)
        : (payload.severity || null);

      return {
        value: payload.value,
        severity: normalizedSeverity
      };
    }

    if (type === 'apocalypseTypes' || type === 'bunkerLocations') {
      return { name: payload.name };
    }

    return { value: payload.value };
  }
}
