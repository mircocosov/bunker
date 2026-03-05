import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';

async function createIsolatedApp(): Promise<INestApplication> {
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
  const app = moduleRef.createNestApplication();
  app.setGlobalPrefix('bunker/api');
  await app.init();
  return app;
}

describe('Game action cards integration', () => {
  it('deals cards on start and allows using bunker upgrade card', async () => {
    const app = await createIsolatedApp();

    await request(app.getHttpServer()).patch('/bunker/api/admin/settings').send({ minPlayersToStart: 3 }).expect(200);

    await request(app.getHttpServer())
      .post('/bunker/api/admin/action-cards')
      .send({ type: 'upgrade', target: 'bunker', scope: 'bunker_upgrade', description: 'Solar panels' })
      .expect(201);

    await request(app.getHttpServer())
      .post('/bunker/api/admin/action-cards')
      .send({ type: 'replace', target: 'hobby', scope: 'self', description: 'Change hobby' })
      .expect(201);

    await request(app.getHttpServer()).post('/bunker/api/admin/game/create-room').send({ sceneMode: 'random' }).expect(201);
    for (const nickname of ['p1', 'p2', 'p3']) {
      await request(app.getHttpServer()).post('/bunker/api/game/join').send({ nickname }).expect(201);
    }

    const startRes = await request(app.getHttpServer()).post('/bunker/api/admin/game/start').send({}).expect(201);
    expect(startRes.body.playerActionCards.p1).toHaveLength(2);

    const bunkerCard = startRes.body.playerActionCards.p1.find((card: any) => card.scope === 'bunker_upgrade');
    expect(bunkerCard).toBeDefined();

    const useRes = await request(app.getHttpServer())
      .post('/bunker/api/game/action-cards/use')
      .send({ nickname: 'p1', cardId: bunkerCard.id })
      .expect(201);

    expect(useRes.body.playerActionCards.p1).toHaveLength(1);
    expect(useRes.body.bunkerUpgrades).toEqual([{ nickname: 'p1', cardId: bunkerCard.id, description: 'Solar panels' }]);

    await app.close();
  });

  it('keeps bunker upgrades after the card owner is kicked', async () => {
    const app = await createIsolatedApp();

    await request(app.getHttpServer()).patch('/bunker/api/admin/settings').send({ minPlayersToStart: 3 }).expect(200);

    await request(app.getHttpServer())
      .post('/bunker/api/admin/action-cards')
      .send({ type: 'upgrade', target: 'bunker', scope: 'bunker_upgrade', description: 'Water recycler' })
      .expect(201);

    await request(app.getHttpServer())
      .post('/bunker/api/admin/action-cards')
      .send({ type: 'replace', target: 'fact', scope: 'self', description: 'Change fact' })
      .expect(201);

    await request(app.getHttpServer()).post('/bunker/api/admin/game/create-room').send({ sceneMode: 'random' }).expect(201);
    for (const nickname of ['p1', 'p2', 'p3']) {
      await request(app.getHttpServer()).post('/bunker/api/game/join').send({ nickname }).expect(201);
    }

    const startRes = await request(app.getHttpServer()).post('/bunker/api/admin/game/start').send({}).expect(201);
    const bunkerCard = startRes.body.playerActionCards.p1.find((card: any) => card.scope === 'bunker_upgrade');

    await request(app.getHttpServer())
      .post('/bunker/api/game/action-cards/use')
      .send({ nickname: 'p1', cardId: bunkerCard.id })
      .expect(201);

    await request(app.getHttpServer()).post('/bunker/api/admin/game/vote/start').send({}).expect(201);
    await request(app.getHttpServer()).post('/bunker/api/game/vote').send({ voter: 'p1', target: 'p2' }).expect(201);
    await request(app.getHttpServer()).post('/bunker/api/game/vote').send({ voter: 'p2', target: 'p1' }).expect(201);
    await request(app.getHttpServer()).post('/bunker/api/game/vote').send({ voter: 'p3', target: 'p1' }).expect(201);

    const finishRes = await request(app.getHttpServer()).post('/bunker/api/admin/game/vote/finish').send({}).expect(201);
    expect(finishRes.body.voteRound.kickedNickname).toBe('p1');
    expect(finishRes.body.observers).toContain('p1');
    expect(finishRes.body.bunkerUpgrades).toEqual([{ nickname: 'p1', cardId: bunkerCard.id, description: 'Water recycler' }]);

    await app.close();
  });
});
