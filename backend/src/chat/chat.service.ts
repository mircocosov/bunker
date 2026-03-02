import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ChatService {
  private lastSent = new Map<string, number>();
  private readonly cooldownMs: number;

  constructor(
    private prisma: PrismaService,
    configService: ConfigService
  ) {
    this.cooldownMs = Number(configService.get('CHAT_COOLDOWN_MS') ?? 2000);
  }

  async send(userId: string, text: string) {
    const now = Date.now();
    const prev = this.lastSent.get(userId) ?? 0;
    const retryAfterMs = this.cooldownMs - (now - prev);
    if (retryAfterMs > 0) {
      throw new BadRequestException({
        message: 'Антиспам: подождите перед следующим сообщением',
        retryAfterMs,
        cooldownMs: this.cooldownMs
      });
    }
    this.lastSent.set(userId, now);

    const words = await this.prisma.chatFilterWord.findMany();
    let filtered = text;
    for (const w of words) {
      filtered = filtered.replace(new RegExp(w.word, 'gi'), '***');
    }

    const message = await this.prisma.siteChatMessage.create({
      data: { userId, message: filtered },
      include: { user: true }
    });
    const total = await this.prisma.siteChatMessage.count();
    if (total > 200) {
      const old = await this.prisma.siteChatMessage.findMany({ orderBy: { createdAt: 'asc' }, take: total - 200 });
      await this.prisma.siteChatMessage.deleteMany({ where: { id: { in: old.map((x) => x.id) } } });
    }
    return message;
  }

  history() {
    return this.prisma.siteChatMessage.findMany({ take: 200, orderBy: { createdAt: 'asc' }, include: { user: true } });
  }

  getCooldownMs() {
    return this.cooldownMs;
  }
}
