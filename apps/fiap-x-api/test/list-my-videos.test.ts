import { destroyTestApp } from '@fiap-x/test-factory/utils';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { createTestApp } from './create-app';
import { getBearerToken } from './utils/get-bearer-token';

describe('POST /v1/me/videos', () => {
  let app: INestApplication;
  let server: App;

  beforeAll(async () => {
    app = await createTestApp();
    server = app.getHttpServer();
  });

  afterAll(async () => {
    await destroyTestApp(app);
  });

  it('should return empty list if no videos exsit', async () => {
    const bearer = await getBearerToken(app);
    const response = await request(server)
      .get('/v1/me/videos')
      .set('Authorization', bearer);

    const { statusCode, body } = response;
    expect(statusCode).toBe(200);
    expect(body.data).toBeInstanceOf(Array);
    expect(body.data.length).toBe(0);
  });

  it('should list existing videos', async () => {
    const bearer = await getBearerToken(app);
    await request(server)
      .post('/v1/me/videos')
      .send({
        filename: 'My Awesome Video',
        snapshotIntervalInSeconds: 10,
      })
      .set('Authorization', bearer);

    const response = await request(server)
      .get('/v1/me/videos')
      .set('Authorization', bearer);

    const { statusCode, body } = response;
    expect(statusCode).toBe(200);
    expect(body.data).toBeInstanceOf(Array);
  });
});
