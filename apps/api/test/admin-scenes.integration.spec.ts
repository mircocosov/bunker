import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Admin scenes integration', () => {
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

  it('uploads image and serves it from /bunker/api/assets/scenes/*', async () => {
    const uploadRes = await request(app.getHttpServer())
      .post('/bunker/api/admin/scenes/upload')
      .attach('file', Buffer.from('fakepngcontent'), 'scene.png')
      .expect(201);

    expect(uploadRes.body.url).toMatch(/^\/bunker\/api\/assets\/scenes\/.+/);

    await request(app.getHttpServer()).get(uploadRes.body.url).expect(200);
  });

  it('supports CRUD for scenes', async () => {
    const uploadRes = await request(app.getHttpServer())
      .post('/bunker/api/admin/scenes/upload')
      .attach('file', Buffer.from('fakepngcontent2'), 'scene2.png')
      .expect(201);

    const createRes = await request(app.getHttpServer())
      .post('/bunker/api/admin/scenes')
      .send({
        name: 'Meteor Rain',
        description: 'Sky is falling',
        imageUrl: uploadRes.body.url,
      })
      .expect(201);

    const id = createRes.body.id;
    expect(createRes.body).toEqual({
      id,
      name: 'Meteor Rain',
      description: 'Sky is falling',
      imageUrl: uploadRes.body.url,
    });

    const listRes = await request(app.getHttpServer()).get('/bunker/api/admin/scenes').expect(200);
    expect(listRes.body).toEqual(
      expect.arrayContaining([
        {
          id,
          name: 'Meteor Rain',
          description: 'Sky is falling',
          imageUrl: uploadRes.body.url,
        },
      ]),
    );

    const patchRes = await request(app.getHttpServer())
      .patch(`/bunker/api/admin/scenes/${id}`)
      .send({ description: 'Sky is still falling' })
      .expect(200);

    expect(patchRes.body.description).toBe('Sky is still falling');

    await request(app.getHttpServer()).delete(`/bunker/api/admin/scenes/${id}`).expect(200);

    const afterDelete = await request(app.getHttpServer()).get('/bunker/api/admin/scenes').expect(200);
    expect(afterDelete.body.find((scene: { id: number }) => scene.id === id)).toBeUndefined();
  });
});
