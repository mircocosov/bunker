import { BadRequestException } from '@nestjs/common';
import { ChatService } from './chat.service';

describe('ChatService', () => {
  const makeService = (cooldown = '2') => {
    const prisma = {
      chatFilterWord: { findMany: jest.fn().mockResolvedValue([]) },
      lobby: { findFirst: jest.fn().mockResolvedValue({ id: 'lobby-1' }) },
      lobbyPlayer: { findFirst: jest.fn().mockResolvedValue({ id: 'lp-1' }) },
      user: { findUnique: jest.fn().mockResolvedValue({ twitchNick: 'nick' }) },
      bannedUser: { findUnique: jest.fn().mockResolvedValue(null) },
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

  it('rejects non-members and banned users', async () => {
    const { service, prisma } = makeService('1');
    prisma.lobbyPlayer.findFirst.mockResolvedValueOnce(null);
    await expect(service.send('u1', 'hello')).rejects.toBeInstanceOf(BadRequestException);

    prisma.lobbyPlayer.findFirst.mockResolvedValueOnce({ id: 'lp-1' });
    prisma.bannedUser.findUnique.mockResolvedValueOnce({ id: 'ban-1' });
    await expect(service.send('u1', 'hello')).rejects.toBeInstanceOf(BadRequestException);
  });
});
