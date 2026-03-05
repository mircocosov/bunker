import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Admin action cards integration', () => {
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

  it('supports CRUD for action cards', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/bunker/api/admin/action-cards')
      .send({
        type: 'replace',
        target: 'profession',
        scope: 'self',
        description: 'Replace your profession',
      })
      .expect(201);

    const id = createRes.body.id;
    expect(createRes.body).toEqual({
      id,
      type: 'replace',
      target: 'profession',
      scope: 'self',
      description: 'Replace your profession',
    });

    const listRes = await request(app.getHttpServer()).get('/bunker/api/admin/action-cards').expect(200);
    expect(listRes.body).toEqual(
      expect.arrayContaining([
        {
          id,
          type: 'replace',
          target: 'profession',
          scope: 'self',
          description: 'Replace your profession',
        },
      ]),
    );

    const updateRes = await request(app.getHttpServer())
      .patch(`/bunker/api/admin/action-cards/${id}`)
      .send({ type: 'upgrade', scope: 'bunker_upgrade', description: 'Improve bunker ventilation' })
      .expect(200);

    expect(updateRes.body).toEqual({
      id,
      type: 'upgrade',
      target: 'profession',
      scope: 'bunker_upgrade',
      description: 'Improve bunker ventilation',
    });

    await request(app.getHttpServer()).delete(`/bunker/api/admin/action-cards/${id}`).expect(200);
    const afterDelete = await request(app.getHttpServer()).get('/bunker/api/admin/action-cards').expect(200);
    expect(afterDelete.body.find((card: { id: number }) => card.id === id)).toBeUndefined();
  });

  it('returns 400 for invalid enum values', async () => {
    await request(app.getHttpServer())
      .post('/bunker/api/admin/action-cards')
      .send({
        type: 'invalid',
        target: 'profession',
        scope: 'self',
        description: 'x',
      })
      .expect(400);

    await request(app.getHttpServer())
      .post('/bunker/api/admin/action-cards')
      .send({
        type: 'replace',
        target: 'profession',
        scope: 'invalid',
        description: 'x',
      })
      .expect(400);
  });

  it('returns 404 for update/delete of missing action card', async () => {
    await request(app.getHttpServer())
      .patch('/bunker/api/admin/action-cards/9999')
      .send({ description: 'missing' })
      .expect(404);

    await request(app.getHttpServer()).delete('/bunker/api/admin/action-cards/9999').expect(404);
  });
});
