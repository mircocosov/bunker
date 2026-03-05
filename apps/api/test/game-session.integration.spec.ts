import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Game session integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('bunker/api');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('supports room creation, registration, and admin start with single global game rule', async () => {
    await request(app.getHttpServer())
      .post('/bunker/api/admin/settings')
      .send({ minPlayersToStart: 2 })
      .expect(404);

    await request(app.getHttpServer()).patch('/bunker/api/admin/settings').send({ minPlayersToStart: 2 }).expect(200);

    const createRoomRes = await request(app.getHttpServer())
      .post('/bunker/api/admin/game/create-room')
      .send({ sceneMode: 'random' })
      .expect(201);

    expect(createRoomRes.body.status).toBe('lobby');
    expect(createRoomRes.body.players).toEqual([]);
    expect(createRoomRes.body.minPlayersToStart).toBe(2);

    await request(app.getHttpServer())
      .post('/bunker/api/admin/game/create-room')
      .send({ sceneMode: 'random' })
      .expect(409);

    await request(app.getHttpServer()).post('/bunker/api/game/join').send({ nickname: 'nick1' }).expect(201);
    await request(app.getHttpServer()).post('/bunker/api/game/join').send({ nickname: 'nick2' }).expect(201);

    const startRes = await request(app.getHttpServer()).post('/bunker/api/admin/game/start').send({}).expect(201);
    expect(startRes.body.status).toBe('started');
    expect(startRes.body.players).toEqual(['nick1', 'nick2']);
    expect(startRes.body.snapshot.selectedScene).toBe('random');
  });

  it('snapshot is frozen for current game after start while admin data can change', async () => {
    await request(app.getHttpServer())
      .post('/bunker/api/admin/traits/profession')
      .send({ value: 'Engineer' })
      .expect(201);

    await request(app.getHttpServer())
      .post('/bunker/api/admin/chat-filter')
      .send({ pattern: 'abc' })
      .expect(201);

    const stateBefore = await request(app.getHttpServer()).get('/bunker/api/admin/game/state').expect(200);
    expect(stateBefore.body.snapshot.traits.some((t: any) => t.value === 'Engineer')).toBe(false);

    const stateAfter = await request(app.getHttpServer()).get('/bunker/api/admin/game/state').expect(200);
    expect(stateAfter.body.snapshot.traits.some((t: any) => t.value === 'Engineer')).toBe(false);
    expect(stateAfter.body.snapshot.chatFilter.some((f: any) => f.pattern === 'abc')).toBe(false);
  });

  it('blacklisted nickname cannot join active lobby (observer-only)', async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    const isolated = moduleRef.createNestApplication();
    isolated.setGlobalPrefix('bunker/api');
    await isolated.init();

    await request(isolated.getHttpServer()).patch('/bunker/api/admin/settings').send({ minPlayersToStart: 1 }).expect(200);
    await request(isolated.getHttpServer())
      .post('/bunker/api/admin/game/create-room')
      .send({ sceneMode: 'fixed', sceneId: 1 })
      .expect(201);

    await request(isolated.getHttpServer())
      .post('/bunker/api/admin/blacklist')
      .send({ nickname: 'toxic', reason: 'ban' })
      .expect(201);

    await request(isolated.getHttpServer()).post('/bunker/api/game/join').send({ nickname: 'toxic' }).expect(409);

    await isolated.close();
  });

  it('finishes game with unique survivors and allows creating a new global game', async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    const isolated = moduleRef.createNestApplication();
    isolated.setGlobalPrefix('bunker/api');
    await isolated.init();

    await request(isolated.getHttpServer()).patch('/bunker/api/admin/settings').send({ minPlayersToStart: 2, bunkerSlots: 1 }).expect(200);
    await request(isolated.getHttpServer()).post('/bunker/api/admin/game/create-room').send({ sceneMode: 'random' }).expect(201);
    await request(isolated.getHttpServer()).post('/bunker/api/game/join').send({ nickname: 'a' }).expect(201);
    await request(isolated.getHttpServer()).post('/bunker/api/game/join').send({ nickname: 'b' }).expect(201);
    await request(isolated.getHttpServer()).post('/bunker/api/admin/game/start').send({}).expect(201);

    await request(isolated.getHttpServer()).post('/bunker/api/admin/game/finish').send({ survivors: ['a', 'a'] }).expect(409);

    const finishRes = await request(isolated.getHttpServer())
      .post('/bunker/api/admin/game/finish')
      .send({ survivors: ['a'] })
      .expect(201);

    expect(finishRes.body.finished).toBe(true);
    expect(finishRes.body.survivors).toEqual(['a']);

    await request(isolated.getHttpServer())
      .post('/bunker/api/admin/game/create-room')
      .send({ sceneMode: 'random' })
      .expect(201);

    await isolated.close();
  });

});
