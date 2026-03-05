import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { io, Socket } from 'socket.io-client';
import { AddressInfo } from 'net';
import { AppModule } from '../src/app.module';

describe('Blacklist integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('bunker/api');
    await app.listen(0);
  });

  afterAll(async () => {
    await app.close();
  });

  it('supports blacklist CRUD', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/bunker/api/admin/blacklist')
      .send({ nickname: 'bad_actor', reason: 'spam' })
      .expect(201);

    const id = createRes.body.id;
    expect(createRes.body).toEqual({ id, nickname: 'bad_actor', reason: 'spam' });

    const listRes = await request(app.getHttpServer()).get('/bunker/api/admin/blacklist').expect(200);
    expect(listRes.body).toEqual([{ id, nickname: 'bad_actor', reason: 'spam' }]);

    const updateRes = await request(app.getHttpServer())
      .patch(`/bunker/api/admin/blacklist/${id}`)
      .send({ nickname: 'bad_actor', reason: 'repeated spam' })
      .expect(200);

    expect(updateRes.body).toEqual({ id, nickname: 'bad_actor', reason: 'repeated spam' });

    await request(app.getHttpServer()).delete(`/bunker/api/admin/blacklist/${id}`).expect(200);
    await request(app.getHttpServer()).get('/bunker/api/admin/blacklist').expect(200, []);
  });

  it('enforces banned user as observer-only in room.join', async () => {
    const address = app.getHttpServer().address() as AddressInfo;
    const socket: Socket = io(`http://127.0.0.1:${address.port}/rooms`, { transports: ['websocket'] });

    await new Promise<void>((resolve, reject) => {
      socket.on('connect', () => resolve());
      socket.on('connect_error', reject);
    });

    await request(app.getHttpServer())
      .post('/bunker/api/admin/blacklist')
      .send({ nickname: socket.id, reason: 'abuse' })
      .expect(201);

    const warning = await new Promise<any>((resolve) => {
      socket.on('system.warning', resolve);
      socket.emit('room.join', { event: 'room.join', action_id: 'w1', roomCode: 'ROOM_BL' });
    });

    expect(warning).toEqual({
      event: 'system.warning',
      message: 'BANNED_OBSERVER_ONLY',
      details: { nickname: socket.id },
    });

    socket.disconnect();
  });
});
