import { LobbyService } from './lobby.service';

describe('LobbyService', () => {
  const makeService = (env: Record<string, string | undefined> = {}) => {
    const prisma = {
      lobby: {
        findFirst: jest.fn(),
        create: jest.fn()
      }
    } as any;

    const configService = {
      get: (key: string) => env[key]
    } as any;

    return { service: new LobbyService(prisma, configService), prisma };
  };

  it('returns existing active lobby instead of throwing when create is called repeatedly', async () => {
    const { service, prisma } = makeService();
    const existingLobby = { id: 'lobby-1', isActive: true, phase: 'REVEAL' };

    prisma.lobby.findFirst.mockResolvedValue(existingLobby);

    await expect(
      service.create({
        playersLimit: 8,
        voteTimerSec: 60,
        revealTimerSec: 30,
        initialRevealedCount: 1
      })
    ).resolves.toEqual(existingLobby);

    expect(prisma.lobby.create).not.toHaveBeenCalled();
  });

  it('creates a new active lobby when none exists', async () => {
    const { service, prisma } = makeService();
    const createdLobby = { id: 'lobby-2', isActive: true, phase: 'REVEAL' };

    prisma.lobby.findFirst.mockResolvedValue(null);
    prisma.lobby.create.mockResolvedValue(createdLobby);

    await expect(
      service.create({
        playersLimit: 10,
        voteTimerSec: 45,
        revealTimerSec: 20,
        initialRevealedCount: 2,
        apocalypseTypeId: 'ap-1',
        bunkerLocationTypeId: 'loc-1'
      })
    ).resolves.toEqual(createdLobby);

    expect(prisma.lobby.create).toHaveBeenCalledWith({
      data: {
        playersLimit: 10,
        voteTimerSec: 45,
        revealTimerSec: 20,
        initialRevealedCount: 2,
        apocalypseTypeId: 'ap-1',
        bunkerLocationTypeId: 'loc-1',
        isActive: true,
        phase: 'REVEAL'
      }
    });
  });

  it('uses duration defaults from env when timers are omitted', async () => {
    const { service, prisma } = makeService({
      VOTING_DURATION_SECONDS: '77',
      OPEN_CHARACTERISTIC_DURATION_SECONDS: '33'
    });

    prisma.lobby.findFirst.mockResolvedValue(null);
    prisma.lobby.create.mockResolvedValue({ id: 'lobby-3' });

    await service.create({ playersLimit: 6 });

    expect(prisma.lobby.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        voteTimerSec: 77,
        revealTimerSec: 33,
        initialRevealedCount: 1
      })
    });
  });
});
