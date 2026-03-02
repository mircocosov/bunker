import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('App e2e', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const mod = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = mod.createNestApplication();
    app.setGlobalPrefix('bunker/api');
    await app.init();
  });

  it('creates auth code', async () => {
    const res = await request(app.getHttpServer()).post('/bunker/api/auth/request-code').send({ twitchNick: 'tester' });
    expect(res.status).toBeLessThan(500);
  });

  afterAll(async () => {
    await app.close();
  });
});
