import { destroyTestApp } from '@fiap-x/test-factory/utils';
import { INestApplication } from '@nestjs/common';
import { Types } from 'mongoose';
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

  it('should return not found if no videos exsit', async () => {
    const bearer = await getBearerToken(app);
    const id = new Types.ObjectId().toHexString();
    const response = await request(server)
      .get(`/v1/me/videos/${id}`)
      .set('Authorization', bearer);
    const { statusCode } = response;
    expect(statusCode).toBe(404);
  });

  it('should return if video exists', async () => {
    const bearer = await getBearerToken(app);
    const createResponse = await request(server)
      .post('/v1/me/videos')
      .send({
        filename: 'My Awesome Video',
        snapshotIntervalInSeconds: 10,
      })
      .set('Authorization', bearer);
    const { id } = createResponse.body;

    const response = await request(server)
      .get(`/v1/me/videos/${id}`)
      .set('Authorization', bearer);

    const { statusCode, body } = response;
    expect(statusCode).toBe(200);
    expect(body.id).toBe(id);
  });
});
