import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  kick(userId: string) {
    return this.prisma.lobbyPlayer.updateMany({ data: { status: 'SPECTATOR' }, where: { userId, lobby: { isActive: true } } });
  }

  ban(twitchNick: string) {
    return this.prisma.bannedUser.upsert({ where: { twitchNick }, update: {}, create: { twitchNick } });
  }

  unban(twitchNick: string) {
    return this.prisma.bannedUser.delete({ where: { twitchNick } });
  }

  bans(search?: string) {
    return this.prisma.bannedUser.findMany({ where: search ? { twitchNick: { contains: search } } : {} });
  }
}
