import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Role } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private prisma: PrismaService, private jwt: JwtService, private cfg: ConfigService) {}

  getCodeTtlMs() {
    return Number(this.cfg.get<string>('AUTH_CODE_TTL_MS') ?? 15_000);
  }

  generateCode() {
    return String(Math.floor(100000 + Math.random() * 900000));
  }

  async requestCode(twitchNick: string) {
    const code = this.generateCode();
    const ttlMs = this.getCodeTtlMs();
    const expiresAt = new Date(Date.now() + ttlMs);
    await this.prisma.authAttempt.create({ data: { twitchNick, code, expiresAt } });
    return { code, ttlMs, expiresAt };
  }

  async verifyByChat(senderNick: string, message: string) {
    const text = message.trim();
    if (!/^\d{6}$/.test(text)) return null;

    const normalizedNick = senderNick.toLowerCase();
    const attempt = await this.prisma.authAttempt.findFirst({
      where: { twitchNick: { equals: normalizedNick, mode: 'insensitive' }, code: text, consumedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' }
    });
    if (!attempt) return null;

    if (attempt.twitchNick.toLowerCase() !== normalizedNick) return null;
    this.logger.log(`[Twitch] matched attempt id=${attempt.id} nick=${senderNick}`);

    const admins = (this.cfg.get<string>('ADMINS') ?? '').split(',').filter(Boolean);
    const role = admins.some((admin) => admin.toLowerCase() === normalizedNick) ? Role.ADMIN : Role.USER;
    const user = await this.prisma.user.upsert({ where: { twitchNick: attempt.twitchNick }, update: { role }, create: { twitchNick: attempt.twitchNick, role } });
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
