import { ActionDedupeService } from '../src/realtime/action-dedupe.service';
import { RoomRegistryService } from '../src/realtime/room-registry.service';
import { RoomsGateway } from '../src/realtime/rooms.gateway';

function makeSocket(id = 's1') {
  return {
    id,
    data: {},
    join: jest.fn(),
    emit: jest.fn(),
  } as any;
}

describe('RoomsGateway', () => {
  it('emits warning on invalid room.join payload', () => {
    const gateway = new RoomsGateway(new RoomRegistryService(), new ActionDedupeService());
    gateway.server = { to: jest.fn(() => ({ emit: jest.fn() })) } as any;
    const socket = makeSocket();

    gateway.handleJoin({ bad: true }, socket);

    expect(socket.emit).toHaveBeenCalledWith('system.warning', {
      event: 'system.warning',
      message: 'Invalid room.join payload',
    });
  });

  it('joins room and emits room.state_updated on valid room.join', () => {
    const gateway = new RoomsGateway(new RoomRegistryService(), new ActionDedupeService());
    const emit = jest.fn();
    gateway.server = { to: jest.fn(() => ({ emit })) } as any;
    const socket = makeSocket();

    gateway.handleJoin({ event: 'room.join', action_id: 'a1', roomCode: 'ABC' }, socket);

    expect(socket.join).toHaveBeenCalledWith('ABC');
    expect(emit).toHaveBeenCalledWith(
      'room.state_updated',
      expect.objectContaining({
        event: 'room.state_updated',
        roomId: 'ABC',
        status: 'waiting',
      }),
    );
  });

  it('unknown room on ready emits ROOM_NOT_FOUND warning', () => {
    const gateway = new RoomsGateway(new RoomRegistryService(), new ActionDedupeService());
    gateway.server = { to: jest.fn(() => ({ emit: jest.fn() })) } as any;
    const socket = makeSocket();

    gateway.handleReady({ event: 'room.ready', action_id: 'a2', roomId: 'MISSING' }, socket);

    expect(socket.emit).toHaveBeenCalledWith('system.warning', {
      event: 'system.warning',
      message: 'ROOM_NOT_FOUND',
      details: { roomId: 'MISSING' },
    });
  });

  it('duplicate action_id does not emit room.state_updated twice', () => {
    const gateway = new RoomsGateway(new RoomRegistryService(), new ActionDedupeService());
    const emit = jest.fn();
    gateway.server = { to: jest.fn(() => ({ emit })) } as any;
    const socket = makeSocket();

    gateway.handleJoin({ event: 'room.join', action_id: 'dup-1', roomCode: 'ABC' }, socket);
    gateway.handleJoin({ event: 'room.join', action_id: 'dup-1', roomCode: 'ABC' }, socket);

    expect(emit).toHaveBeenCalledTimes(1);
  });
});
