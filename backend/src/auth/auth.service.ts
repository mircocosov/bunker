import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Role } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService, private cfg: ConfigService) {}

  generateCode() {
    return String(Math.floor(100000 + Math.random() * 900000));
  }

  async requestCode(twitchNick: string) {
    const code = this.generateCode();
    const expiresAt = new Date(Date.now() + 15_000);
    await this.prisma.authAttempt.create({ data: { twitchNick, code, expiresAt } });
    return { code };
  }

  async verifyByChat(senderNick: string, message: string) {
    if (!/^\d{6}$/.test(message)) return null;
    const attempt = await this.prisma.authAttempt.findFirst({
      where: { twitchNick: senderNick, code: message, consumedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' }
    });
    if (!attempt) return null;

    const admins = (this.cfg.get<string>('ADMINS') ?? '').split(',').filter(Boolean);
    const role = admins.includes(senderNick) ? Role.ADMIN : Role.USER;
    const user = await this.prisma.user.upsert({ where: { twitchNick: senderNick }, update: { role }, create: { twitchNick: senderNick, role } });
    await this.prisma.authAttempt.update({ where: { id: attempt.id }, data: { consumedAt: new Date() } });
    return this.sign(user.id, user.twitchNick, user.role);
  }

  sign(userId: string, twitchNick: string, role: Role) {
    return this.jwt.sign({ userId, twitchNick, role });
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();
    return user;
  }
}
