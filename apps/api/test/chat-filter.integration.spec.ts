import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { io, Socket } from 'socket.io-client';
import { AddressInfo } from 'net';
import { AppModule } from '../src/app.module';

describe('Chat filter integration', () => {
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

  it('supports CRUD + mask-preview', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/bunker/api/admin/chat-filter')
      .send({ pattern: 'badword' })
      .expect(201);

    const id = createRes.body.id;
    expect(createRes.body).toEqual({ id, pattern: 'badword' });

    const listRes = await request(app.getHttpServer()).get('/bunker/api/admin/chat-filter').expect(200);
    expect(listRes.body).toEqual([{ id, pattern: 'badword' }]);

    const maskRes = await request(app.getHttpServer())
      .post('/bunker/api/admin/chat-filter/mask-preview')
      .send({ text: 'hello badword world' })
      .expect(201);

    expect(maskRes.body).toEqual({ masked: 'hello ******* world' });

    const updateRes = await request(app.getHttpServer())
      .patch(`/bunker/api/admin/chat-filter/${id}`)
      .send({ pattern: 'evil' })
      .expect(200);

    expect(updateRes.body).toEqual({ id, pattern: 'evil' });

    await request(app.getHttpServer()).delete(`/bunker/api/admin/chat-filter/${id}`).expect(200);
    await request(app.getHttpServer()).get('/bunker/api/admin/chat-filter').expect(200, []);
  });

  it('applies filter to chat websocket event', async () => {
    await request(app.getHttpServer()).post('/bunker/api/admin/chat-filter').send({ pattern: 'toxic' }).expect(201);

    const address = app.getHttpServer().address() as AddressInfo;
    const socket = io(`http://127.0.0.1:${address.port}/rooms`, { transports: ['websocket'] });

    await new Promise<void>((resolve, reject) => {
      socket.on('connect', () => resolve());
      socket.on('connect_error', reject);
    });

    const message = await new Promise<any>((resolve) => {
      socket.on('match.chat_message', resolve);
      socket.emit('match.chat_send', {
        event: 'match.chat_send',
        action_id: 'c1',
        match_id: 'M1',
        text: 'you are toxic here',
      });
    });

    expect(message.text).toBe('you are ***** here');
    socket.disconnect();
  });

  it('rejects character phrase with forbidden words', async () => {
    await request(app.getHttpServer()).post('/bunker/api/admin/chat-filter').send({ pattern: 'curse' }).expect(201);

    await request(app.getHttpServer())
      .post('/bunker/api/character/phrase')
      .send({ phrase: 'i am curse' })
      .expect(400);

    await request(app.getHttpServer())
      .post('/bunker/api/character/phrase')
      .send({ phrase: 'friendly text' })
      .expect(201);
  });
});
