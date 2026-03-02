import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ChatService {
  private lastSent = new Map<string, number>();
  constructor(private prisma: PrismaService) {}

  async send(userId: string, text: string) {
    const now = Date.now();
    const prev = this.lastSent.get(userId) ?? 0;
    if (now - prev < 2000) throw new BadRequestException('Антиспам: 1 сообщение / 2 секунды');
    this.lastSent.set(userId, now);

    const words = await this.prisma.chatFilterWord.findMany();
    let filtered = text;
    for (const w of words) {
      filtered = filtered.replace(new RegExp(w.word, 'gi'), '***');
    }

    const message = await this.prisma.siteChatMessage.create({ data: { userId, message: filtered } });
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
}
