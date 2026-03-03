import { LobbyService } from './lobby.service';

describe('LobbyService', () => {
  const makeService = () => {
    const prisma = {
      lobby: {
        findFirst: jest.fn(),
        create: jest.fn()
      }
    } as any;

    return { service: new LobbyService(prisma), prisma };
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
});
