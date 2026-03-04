import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Auth + Health integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/v1/health returns ok', async () => {
    const res = await request(app.getHttpServer()).get('/api/v1/health').expect(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('POST /api/v1/auth/guest returns guest token payload', async () => {
    const res = await request(app.getHttpServer()).post('/api/v1/auth/guest').send({}).expect(201);
    expect(res.body.role).toBe('guest');
    expect(res.body.user_id).toContain('guest_');
    expect(typeof res.body.access_token).toBe('string');
  });

  it('POST /api/v1/auth/login returns player token payload', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'qa@example.com', password: 'secret' })
      .expect(201);

    expect(res.body).toMatchObject({
      user_id: 'qa@example.com',
      role: 'player',
    });
    expect(typeof res.body.access_token).toBe('string');
  });
});
