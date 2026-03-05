import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Admin traits integration', () => {
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

  it('supports CRUD for non-health category', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/bunker/api/admin/traits/profession')
      .send({ value: 'Engineer' })
      .expect(201);

    expect(createRes.body).toEqual({
      id: expect.any(Number),
      category: 'profession',
      value: 'Engineer',
    });

    const id = createRes.body.id;

    const listRes = await request(app.getHttpServer()).get('/bunker/api/admin/traits/profession').expect(200);
    expect(listRes.body).toEqual([
      {
        id,
        category: 'profession',
        value: 'Engineer',
      },
    ]);

    const updateRes = await request(app.getHttpServer())
      .patch(`/bunker/api/admin/traits/profession/${id}`)
      .send({ value: 'Doctor' })
      .expect(200);

    expect(updateRes.body).toEqual({
      id,
      category: 'profession',
      value: 'Doctor',
    });

    await request(app.getHttpServer()).delete(`/bunker/api/admin/traits/profession/${id}`).expect(200);
    await request(app.getHttpServer()).get('/bunker/api/admin/traits/profession').expect(200, []);
  });

  it('stores health severity fields when enabled', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/bunker/api/admin/traits/health')
      .send({ value: 'Asthma', severityEnabled: true, severityLevel: 70 })
      .expect(201);

    const id = createRes.body.id;
    expect(createRes.body).toEqual({
      id,
      category: 'health',
      value: 'Asthma',
      severityEnabled: true,
      severityLevel: 70,
    });

    const updateRes = await request(app.getHttpServer())
      .patch(`/bunker/api/admin/traits/health/${id}`)
      .send({ severityEnabled: false })
      .expect(200);

    expect(updateRes.body).toEqual({
      id,
      category: 'health',
      value: 'Asthma',
      severityEnabled: false,
    });
  });

  it('returns 404 for update/delete of missing trait', async () => {
    await request(app.getHttpServer())
      .patch('/bunker/api/admin/traits/hobby/9999')
      .send({ value: 'Chess' })
      .expect(404);

    await request(app.getHttpServer()).delete('/bunker/api/admin/traits/hobby/9999').expect(404);
  });

  it('returns 400 for unknown category', async () => {
    await request(app.getHttpServer())
      .post('/bunker/api/admin/traits/unknown')
      .send({ value: 'x' })
      .expect(400);
  });
});
