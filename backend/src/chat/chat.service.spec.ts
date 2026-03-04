import { BadRequestException } from '@nestjs/common';
import { ChatService } from './chat.service';

describe('ChatService', () => {
  const makeService = (cooldown = '2') => {
    const prisma = {
      chatFilterWord: { findMany: jest.fn().mockResolvedValue([]) },
      siteChatMessage: {
        create: jest.fn().mockResolvedValue({ id: 'm1', message: 'hello', user: { twitchNick: 'nick' }, createdAt: new Date().toISOString() }),
        count: jest.fn().mockResolvedValue(1),
        findMany: jest.fn().mockResolvedValue([]),
        deleteMany: jest.fn().mockResolvedValue({ count: 0 })
      }
    } as any;

    const config = { get: (key: string) => (key === 'CHAT_COOLDOWN_SECONDS' ? cooldown : undefined) } as any;
    return { service: new ChatService(prisma, config), prisma };
  };

  it('reads cooldown in seconds from env', () => {
    const { service } = makeService('5');
    expect(service.getCooldownSeconds()).toBe(5);
  });

  it('escapes filter words as plain text and rejects empty messages', async () => {
    const { service, prisma } = makeService('1');
    prisma.chatFilterWord.findMany.mockResolvedValue([{ word: '.*' }]);

    await expect(service.send('u1', '   ')).rejects.toBeInstanceOf(BadRequestException);

    const result = await service.send('u1', 'test .* text');
    expect(prisma.siteChatMessage.create).toHaveBeenCalledWith(expect.objectContaining({ data: { userId: 'u1', message: 'test *** text' } }));
    expect(result).toBeTruthy();
  });
});
