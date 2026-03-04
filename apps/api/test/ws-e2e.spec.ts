import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { io, Socket } from 'socket.io-client';
import { AddressInfo } from 'net';
import { AppModule } from '../src/app.module';
import { serverEvents } from '@bunker/shared';

describe('WS E2E diagnostics (spec-driven)', () => {
  let app: INestApplication;
  let baseUrl: string;
  let socket: Socket;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    await app.listen(0);
    const address = app.getHttpServer().address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${address.port}/rooms`;
  });

  afterEach(() => {
    socket?.disconnect();
  });

  afterAll(async () => {
    await app.close();
  });

  function connect() {
    return new Promise<Socket>((resolve, reject) => {
      const client = io(baseUrl, { transports: ['websocket'] });
      client.on('connect', () => resolve(client));
      client.on('connect_error', reject);
    });
  }

  it('invalid payload -> emits system.warning', async () => {
    socket = await connect();

    const warning = await new Promise<any>((resolve) => {
      socket.on('system.warning', resolve);
      socket.emit('room.join', { bad: true });
    });

    expect(warning).toEqual({ event: 'system.warning', message: 'Invalid room.join payload' });
  });

  it('valid room.join -> emits room.state_updated with valid shared contract', async () => {
    socket = await connect();

    const updated = await new Promise<any>((resolve) => {
      socket.on('room.state_updated', resolve);
      socket.emit('room.join', { event: 'room.join', action_id: 'j1', roomCode: 'ROOM_A' });
    });

    const parsed = serverEvents.roomStateUpdated.safeParse(updated);
    expect(parsed.success).toBe(true);
    expect(updated.roomId).toBe('ROOM_A');
  });

  it('SPEC MUST: room.ready without prior join should be rejected with warning', async () => {
    socket = await connect();

    const warning = await new Promise<any>((resolve) => {
      socket.on('system.warning', resolve);
      socket.emit('room.ready', { event: 'room.ready', action_id: 'r1', roomId: 'UNKNOWN_ROOM' });
      setTimeout(() => resolve(undefined), 400);
    });

    expect(warning).toEqual({ event: 'system.warning', message: 'ROOM_NOT_FOUND', details: { roomId: 'UNKNOWN_ROOM' } });
  });

  it('event_seq should monotonically increase per applied action', async () => {
    socket = await connect();

    const events: any[] = [];
    socket.on('room.state_updated', (payload) => events.push(payload));

    socket.emit('room.join', { event: 'room.join', action_id: 'j2', roomCode: 'ROOM_SEQ' });
    await new Promise((r) => setTimeout(r, 100));
    socket.emit('room.ready', { event: 'room.ready', action_id: 'r2', roomId: 'ROOM_SEQ' });
    await new Promise((r) => setTimeout(r, 100));

    expect(events.length).toBeGreaterThanOrEqual(2);
    const seq = events.map((e) => e.event_seq);
    expect(seq[0]).toBeLessThan(seq[1]);
  });

  it('SPEC MUST idempotency: duplicate action_id should not increase event_seq twice', async () => {
    socket = await connect();

    const events: any[] = [];
    socket.on('room.state_updated', (payload) => events.push(payload));

    socket.emit('room.join', { event: 'room.join', action_id: 'dup-1', roomCode: 'ROOM_DUP' });
    await new Promise((r) => setTimeout(r, 80));
    socket.emit('room.join', { event: 'room.join', action_id: 'dup-1', roomCode: 'ROOM_DUP' });
    await new Promise((r) => setTimeout(r, 150));

    const dupEvents = events.filter((e) => e.roomId === 'ROOM_DUP');
    expect(dupEvents.length).toBe(1);
    expect(dupEvents[0].event_seq).toBe(1);
  });

  it('ready spam should not create inconsistent room state (diagnostic)', async () => {
    socket = await connect();

    const events: any[] = [];
    socket.on('room.state_updated', (payload) => events.push(payload));

    socket.emit('room.join', { event: 'room.join', action_id: 'spam-j', roomCode: 'ROOM_SPAM' });
    await new Promise((r) => setTimeout(r, 60));

    for (let i = 0; i < 10; i++) {
      socket.emit('room.ready', { event: 'room.ready', action_id: `spam-r-${i}`, roomId: 'ROOM_SPAM' });
    }

    await new Promise((r) => setTimeout(r, 200));
    const roomEvents = events.filter((e) => e.roomId === 'ROOM_SPAM');
    const last = roomEvents[roomEvents.length - 1];

    expect(last.status).toBe('ready_check');
    // MUST: ready_count must never exceed players_count
    expect(last.ready_count).toBeLessThanOrEqual(last.players_count);
  });
});
