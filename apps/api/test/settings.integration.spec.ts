import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Settings integration', () => {
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

  it('returns singleton settings with defaults', async () => {
    const res = await request(app.getHttpServer()).get('/bunker/api/admin/settings').expect(200);

    expect(res.body).toEqual({
      voteDurationSec: 60,
      revealDurationSec: 60,
      chatCooldownSec: 3,
      minPlayersToStart: 6,
      bunkerSlots: 3,
      phraseIntervalMinSec: 15,
      phraseIntervalMaxSec: 45,
    });
  });

  it('updates settings partially and preserves singleton state', async () => {
    const patchRes = await request(app.getHttpServer())
      .patch('/bunker/api/admin/settings')
      .send({ voteDurationSec: 90, minPlayersToStart: 8, bunkerSlots: 4 })
      .expect(200);

    expect(patchRes.body).toMatchObject({
      voteDurationSec: 90,
      minPlayersToStart: 8,
      bunkerSlots: 4,
    });

    const res = await request(app.getHttpServer()).get('/bunker/api/admin/settings').expect(200);
    expect(res.body).toMatchObject({
      voteDurationSec: 90,
      minPlayersToStart: 8,
      bunkerSlots: 4,
      revealDurationSec: 60,
      chatCooldownSec: 3,
    });
  });
});
