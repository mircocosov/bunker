import { RoomNotFoundError } from '../src/realtime/errors';
import { RoomRegistryService } from '../src/realtime/room-registry.service';

describe('RoomRegistryService', () => {
  it('joins room and increments event sequence', () => {
    const registry = new RoomRegistryService();

    const s1 = registry.join('roomA', 'u1');
    expect(s1.roomId).toBe('roomA');
    expect(s1.users.size).toBe(1);
    expect(s1.status).toBe('waiting');
    expect(s1.eventSeq).toBe(1);

    const s2 = registry.join('roomA', 'u2');
    expect(s2.users.size).toBe(2);
    expect(s2.eventSeq).toBe(2);
  });

  it('marks user ready and increments event sequence', () => {
    const registry = new RoomRegistryService();
    registry.join('roomB', 'u1');

    const s = registry.ready('roomB', 'u1');
    expect(s.status).toBe('ready_check');
    expect(s.readyUsers.has('u1')).toBe(true);
    expect(s.eventSeq).toBe(2);
  });

  it('throws RoomNotFoundError for unknown room', () => {
    const registry = new RoomRegistryService();
    expect(() => registry.ready('missing', 'u1')).toThrow(RoomNotFoundError);
  });
});
