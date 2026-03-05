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

describe('Game reveal rounds integration', () => {
  it('allows player to reveal selected trait during active round', async () => {
    const app = await createIsolatedApp();

    await request(app.getHttpServer()).patch('/bunker/api/admin/settings').send({ minPlayersToStart: 1, revealDurationSec: 5 }).expect(200);

    for (const [category, value] of [
      ['profession', 'Engineer'],
      ['phobia', 'Darkness'],
      ['hobby', 'Chess'],
      ['luggage', 'Knife'],
      ['fact', 'Volunteer'],
      ['health', 'Myopia'],
    ] as const) {
      await request(app.getHttpServer()).post(`/bunker/api/admin/traits/${category}`).send({ value }).expect(201);
    }

    await request(app.getHttpServer()).post('/bunker/api/admin/game/create-room').send({ sceneMode: 'random' }).expect(201);
    await request(app.getHttpServer()).post('/bunker/api/game/join').send({ nickname: 'nick1' }).expect(201);
    await request(app.getHttpServer()).post('/bunker/api/admin/game/start').send({}).expect(201);

    const roundRes = await request(app.getHttpServer()).post('/bunker/api/admin/game/reveal-round/start').send({}).expect(201);
    expect(roundRes.body.round).toBe(1);
    expect(roundRes.body.revealRound.pendingNicknames).toEqual(['nick1']);
    expect(roundRes.body.playerProfiles[0].traits.every((trait: any) => trait.revealed === false)).toBe(true);

    const revealRes = await request(app.getHttpServer())
      .post('/bunker/api/game/reveal-trait')
      .send({ nickname: 'nick1', category: 'profession' })
      .expect(201);

    const professionTrait = revealRes.body.playerProfiles[0].traits.find((trait: any) => trait.category === 'profession');
    expect(professionTrait.revealed).toBe(true);
    expect(revealRes.body.revealRound).toBeUndefined();

    await app.close();
  });

  it('auto-opens a random hidden trait when reveal timer expires', async () => {
    const app = await createIsolatedApp();

    await request(app.getHttpServer()).patch('/bunker/api/admin/settings').send({ minPlayersToStart: 1, revealDurationSec: 1 }).expect(200);

    for (const [category, value] of [
      ['profession', 'Engineer'],
      ['phobia', 'Darkness'],
      ['hobby', 'Chess'],
      ['luggage', 'Knife'],
      ['fact', 'Volunteer'],
      ['health', 'Myopia'],
    ] as const) {
      await request(app.getHttpServer()).post(`/bunker/api/admin/traits/${category}`).send({ value }).expect(201);
    }

    await request(app.getHttpServer()).post('/bunker/api/admin/game/create-room').send({ sceneMode: 'random' }).expect(201);
    await request(app.getHttpServer()).post('/bunker/api/game/join').send({ nickname: 'nick1' }).expect(201);
    await request(app.getHttpServer()).post('/bunker/api/admin/game/start').send({}).expect(201);
    await request(app.getHttpServer()).post('/bunker/api/admin/game/reveal-round/start').send({}).expect(201);

    await new Promise((resolve) => setTimeout(resolve, 1200));

    const stateRes = await request(app.getHttpServer()).get('/bunker/api/admin/game/state').expect(200);
    const revealedCount = stateRes.body.playerProfiles[0].traits.filter((trait: any) => trait.revealed).length;
    expect(revealedCount).toBe(1);
    expect(stateRes.body.revealRound).toBeUndefined();

    await app.close();
  });
});
