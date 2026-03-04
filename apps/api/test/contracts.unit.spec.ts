import { clientEvents, serverEvents } from '@bunker/shared';

describe('Shared WS contract compatibility (gateway-facing)', () => {
  it('accepts valid client room.join payload', () => {
    const parsed = clientEvents.roomJoin.safeParse({ event: 'room.join', action_id: 'a1', roomCode: 'R1' });
    expect(parsed.success).toBe(true);
  });

  it('accepts valid server room.state_updated payload shape', () => {
    const parsed = serverEvents.roomStateUpdated.safeParse({
      event: 'room.state_updated',
      roomId: 'R1',
      status: 'waiting',
      event_seq: 1,
      players_count: 1,
    });

    expect(parsed.success).toBe(true);
  });
});
