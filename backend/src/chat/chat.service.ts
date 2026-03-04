import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma.service';

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

@Injectable()
export class ChatService {
  private lastSent = new Map<string, number>();
  private readonly cooldownSeconds: number;

  constructor(
    private prisma: PrismaService,
    configService: ConfigService
  ) {
    this.cooldownSeconds = Number(configService.get('CHAT_COOLDOWN_SECONDS') ?? 2);
  }

  async send(userId: string, text: string) {
    const trimmedText = text.trim();
    if (!trimmedText) {
      throw new BadRequestException({ message: 'Сообщение не может быть пустым' });
    }

    const now = Date.now();
    const prev = this.lastSent.get(userId) ?? 0;
    const retryAfterSeconds = this.cooldownSeconds - (now - prev) / 1000;
    if (retryAfterSeconds > 0) {
      throw new BadRequestException({
        message: 'Антиспам: подождите перед следующим сообщением',
        retryAfterSeconds,
        cooldownSeconds: this.cooldownSeconds
      });
    }
    this.lastSent.set(userId, now);

    const words = await this.prisma.chatFilterWord.findMany();
    let filtered = trimmedText;
    for (const w of words) {
      filtered = filtered.replace(new RegExp(escapeRegExp(w.word), 'gi'), '***');
    }

    const message = await this.prisma.siteChatMessage.create({
      data: { userId, message: filtered },
      include: { user: true }
    });
    const total = await this.prisma.siteChatMessage.count();
    if (total > 200) {
      const old = await this.prisma.siteChatMessage.findMany({ orderBy: { createdAt: 'asc' }, take: total - 200 });
      await this.prisma.siteChatMessage.deleteMany({ where: { id: { in: old.map((x: { id: string }) => x.id) } } });
    }
    return message;
  }

  history() {
    return this.prisma.siteChatMessage.findMany({ take: 200, orderBy: { createdAt: 'asc' }, include: { user: true } });
  }

  getCooldownSeconds() {
    return this.cooldownSeconds;
  }
}
