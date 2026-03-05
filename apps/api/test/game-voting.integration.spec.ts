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

describe('Game voting integration', () => {
  it('accepts only first vote from player', async () => {
    const app = await createIsolatedApp();

    await request(app.getHttpServer()).patch('/bunker/api/admin/settings').send({ minPlayersToStart: 3 }).expect(200);
    await request(app.getHttpServer()).post('/bunker/api/admin/game/create-room').send({ sceneMode: 'random' }).expect(201);

    for (const nickname of ['p1', 'p2', 'p3']) {
      await request(app.getHttpServer()).post('/bunker/api/game/join').send({ nickname }).expect(201);
    }

    await request(app.getHttpServer()).post('/bunker/api/admin/game/start').send({}).expect(201);
    await request(app.getHttpServer()).post('/bunker/api/admin/game/vote/start').send({}).expect(201);

    await request(app.getHttpServer()).post('/bunker/api/game/vote').send({ voter: 'p1', target: 'p2' }).expect(201);
    const secondVoteRes = await request(app.getHttpServer())
      .post('/bunker/api/game/vote')
      .send({ voter: 'p1', target: 'p3' })
      .expect(201);

    const p2 = secondVoteRes.body.voteRound.tally.find((item: any) => item.target === 'p2');
    const p3 = secondVoteRes.body.voteRound.tally.find((item: any) => item.target === 'p3');

    expect(p2.votes).toBe(1);
    expect(p3.votes).toBe(0);

    await app.close();
  });

  it('handles tie with twitch votes and random fallback', async () => {
    const app = await createIsolatedApp();

    await request(app.getHttpServer()).patch('/bunker/api/admin/settings').send({ minPlayersToStart: 4 }).expect(200);
    await request(app.getHttpServer()).post('/bunker/api/admin/game/create-room').send({ sceneMode: 'random' }).expect(201);

    for (const nickname of ['p1', 'p2', 'p3', 'p4']) {
      await request(app.getHttpServer()).post('/bunker/api/game/join').send({ nickname }).expect(201);
    }

    await request(app.getHttpServer()).post('/bunker/api/admin/game/start').send({}).expect(201);

    // Round 1: tie p3 vs p4, twitch resolves to p4
    await request(app.getHttpServer()).post('/bunker/api/admin/game/vote/start').send({}).expect(201);
    await request(app.getHttpServer()).post('/bunker/api/game/vote').send({ voter: 'p1', target: 'p3' }).expect(201);
    await request(app.getHttpServer()).post('/bunker/api/game/vote').send({ voter: 'p2', target: 'p4' }).expect(201);
    await request(app.getHttpServer()).post('/bunker/api/game/vote').send({ voter: 'p3', target: 'p4' }).expect(201);
    await request(app.getHttpServer()).post('/bunker/api/game/vote').send({ voter: 'p4', target: 'p3' }).expect(201);

    const twitchResolved = await request(app.getHttpServer())
      .post('/bunker/api/admin/game/vote/finish')
      .send({ twitchVotes: [2, 2, 2] })
      .expect(201);

    expect(twitchResolved.body.voteRound.tieCandidates).toEqual(['p3', 'p4']);
    expect(twitchResolved.body.voteRound.kickedNickname).toBe('p4');
    expect(twitchResolved.body.alivePlayers).toEqual(['p1', 'p2', 'p3']);
    expect(twitchResolved.body.observers).toEqual(['p4']);

    // Round 2: tie p1 vs p2, twitch tie -> random fallback among candidates
    await request(app.getHttpServer()).post('/bunker/api/admin/game/vote/start').send({}).expect(201);
    await request(app.getHttpServer()).post('/bunker/api/game/vote').send({ voter: 'p1', target: 'p2' }).expect(201);
    await request(app.getHttpServer()).post('/bunker/api/game/vote').send({ voter: 'p2', target: 'p1' }).expect(201);

    const fallbackRes = await request(app.getHttpServer())
      .post('/bunker/api/admin/game/vote/finish')
      .send({ twitchVotes: [1, 2] })
      .expect(201);

    expect(fallbackRes.body.voteRound.tieCandidates).toEqual(['p1', 'p2']);
    expect(['p1', 'p2']).toContain(fallbackRes.body.voteRound.kickedNickname);
    expect(fallbackRes.body.alivePlayers.length).toBe(2);
    expect(fallbackRes.body.observers.length).toBe(2);

    await app.close();
  });
});
