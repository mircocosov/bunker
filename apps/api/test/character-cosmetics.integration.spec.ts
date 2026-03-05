import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Character & cosmetics integration', () => {
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

  it('supports admin cosmetics CRUD and category filter', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/bunker/api/admin/cosmetics')
      .send({ category: 'hair', name: 'Mohawk', unlockWins: 1, imageUrl: '/assets/mohawk.png' })
      .expect(201);

    expect(createRes.body.category).toBe('hair');

    await request(app.getHttpServer())
      .patch(`/bunker/api/admin/cosmetics/${createRes.body.id}`)
      .send({ name: 'Neo Mohawk' })
      .expect(200);

    const listRes = await request(app.getHttpServer()).get('/bunker/api/admin/cosmetics?category=hair').expect(200);
    expect(listRes.body).toHaveLength(1);
    expect(listRes.body[0].name).toBe('Neo Mohawk');

    await request(app.getHttpServer()).delete(`/bunker/api/admin/cosmetics/${createRes.body.id}`).expect(200);
    await request(app.getHttpServer()).get('/bunker/api/admin/cosmetics').expect(200, []);
  });

  it('blocks forbidden or too-long phrase and unlocks cosmetics by bunker progress', async () => {
    await request(app.getHttpServer()).post('/bunker/api/admin/chat-filter').send({ pattern: 'bad' }).expect(201);

    await request(app.getHttpServer())
      .post('/bunker/api/admin/cosmetics')
      .send({ category: 'pet', name: 'Cyber Cat', unlockWins: 1 })
      .expect(201);

    await request(app.getHttpServer())
      .post('/bunker/api/character/phrase')
      .send({ nickname: 'hero', phrase: 'this is bad phrase' })
      .expect(400);

    await request(app.getHttpServer())
      .post('/bunker/api/character/phrase')
      .send({ nickname: 'hero', phrase: '123456789012345678901' })
      .expect(400);

    await request(app.getHttpServer())
      .post('/bunker/api/character/phrase')
      .send({ nickname: 'hero', phrase: 'ready' })
      .expect(201);

    await request(app.getHttpServer())
      .patch('/bunker/api/character/equip')
      .send({ nickname: 'hero', category: 'pet', cosmeticId: 2 })
      .expect(400);

    await request(app.getHttpServer()).patch('/bunker/api/admin/settings').send({ minPlayersToStart: 2, bunkerSlots: 1 }).expect(200);
    await request(app.getHttpServer()).post('/bunker/api/admin/game/create-room').send({ sceneMode: 'random' }).expect(201);
    await request(app.getHttpServer()).post('/bunker/api/game/join').send({ nickname: 'hero' }).expect(201);
    await request(app.getHttpServer()).post('/bunker/api/game/join').send({ nickname: 'sidekick' }).expect(201);
    await request(app.getHttpServer()).post('/bunker/api/admin/game/start').send({}).expect(201);

    await request(app.getHttpServer()).post('/bunker/api/admin/game/finish').send({ survivors: ['hero'] }).expect(201);

    await request(app.getHttpServer())
      .patch('/bunker/api/character/equip')
      .send({ nickname: 'hero', category: 'pet', cosmeticId: 2 })
      .expect(200);

    const profileRes = await request(app.getHttpServer()).get('/bunker/api/character/profile/hero').expect(200);
    expect(profileRes.body.wins).toBe(1);
    expect(profileRes.body.phrase).toBe('ready');
    expect(profileRes.body.equipped.pet).toBe(2);
    expect(profileRes.body.unlockedCosmetics.some((item: any) => item.id === 2)).toBe(true);
  });
});
