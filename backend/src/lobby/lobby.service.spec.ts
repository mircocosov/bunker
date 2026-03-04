import { LobbyService } from './lobby.service';

describe('LobbyService', () => {
  const makeService = (env: Record<string, string | undefined> = {}) => {
    const tx = {
      lobby: {
        findFirst: jest.fn(),
        create: jest.fn()
      },
      gameRules: {
        findUnique: jest.fn()
      }
    } as any;

    const prisma = {
      ...tx,
      $transaction: jest.fn(async (cb: any) => cb(tx))
    } as any;

    const configService = {
      get: (key: string) => env[key]
    } as any;

    return { service: new LobbyService(prisma, configService), prisma, tx };
  };

  it('returns existing active lobby instead of creating a duplicate on repeated start', async () => {
    const { service, tx } = makeService();
    const existingLobby = { id: 'lobby-1', isActive: true, phase: 'REVEAL' };

    tx.lobby.findFirst.mockResolvedValue(existingLobby);

    await expect(service.create({ playersLimit: 8 })).resolves.toEqual(existingLobby);
    expect(tx.lobby.create).not.toHaveBeenCalled();
  });

  it('creates lobby based on selected game rules from DB', async () => {
    const { service, tx } = makeService();
    const createdLobby = { id: 'lobby-2', isActive: true, phase: 'REVEAL' };

    tx.lobby.findFirst.mockResolvedValue(null);
    tx.gameRules.findUnique.mockResolvedValueOnce({ id: 'classic-id', votingDurationSec: 66, openCharacteristicDurationSec: 22, initialRevealedCount: 2, bunkerCapacity: 7 });
    tx.lobby.create.mockResolvedValue(createdLobby);

    await expect(service.create({ playersLimit: 0 })).resolves.toEqual(createdLobby);

    expect(tx.lobby.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        playersLimit: 7,
        voteTimerSec: 66,
        revealTimerSec: 22,
        initialRevealedCount: 2,
        gameRulesId: 'classic-id'
      })
    });
  });
});
