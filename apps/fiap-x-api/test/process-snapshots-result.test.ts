import { AmqpService } from '@fiap-x/amqp';
import { routingKeyOf } from '@fiap-x/tactical-design/amqp';
import { destroyTestApp } from '@fiap-x/test-factory/utils';
import { INestApplication } from '@nestjs/common';
import { Types } from 'mongoose';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { setTimeout } from 'timers/promises';
import { SnapshotsProcessed } from '../src/video/application/dtos/snapshots-processed.io';
import { EVideoStatus } from '../src/video/domain/values/video-status.value';
import { createTestApp } from './create-app';
import { getBearerToken } from './utils/get-bearer-token';

describe('ProcessSnapshotsResult', () => {
  let app: INestApplication;
  let server: App;

  beforeAll(async () => {
    app = await createTestApp();
    server = app.getHttpServer();
  });

  afterAll(async () => {
    await destroyTestApp(app);
  });

  const getEvent = (aggregateId: string, isSuccess = true) =>
    new SnapshotsProcessed(
      new Types.ObjectId().toHexString(),
      aggregateId,
      SnapshotsProcessed.name,
      new Date(),
      1,
      {
        id: aggregateId,
        ...(isSuccess
          ? {
              provider: 'AWS::S3',
              bucket: 'test',
              path: `${new Types.ObjectId().toHexString()}/file.zip`,
            }
          : {}),
        status: isSuccess ? 'SUCCESS' : 'FAILED',
        failReason: isSuccess ? null : 'Too Bad',
      },
    );

  it('should handle success result', async () => {
    const bearer = await getBearerToken(app);
    const uploadResponse = await request(server)
      .post('/v1/me/videos')
      .send({
        filename: 'My Awesome Video',
        snapshotIntervalInSeconds: 10,
      })
      .set('Authorization', bearer);
    const { id } = uploadResponse.body;
    const amqp = app.get(AmqpService);
    const successEvent = getEvent(id);
    await amqp.publish(
      `fiap.x.worker.events`,
      routingKeyOf(successEvent.eventName),
      successEvent,
    );

    await setTimeout(500);
    const res = await request(server)
      .get(`/v1/me/videos/${id}`)
      .set('Authorization', bearer);

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe(EVideoStatus.Processed);
  });

  it('should handle failed result', async () => {
    const bearer = await getBearerToken(app);
    const uploadResponse = await request(server)
      .post('/v1/me/videos')
      .send({
        filename: 'My Awesome Video',
        snapshotIntervalInSeconds: 10,
      })
      .set('Authorization', bearer);
    const { id } = uploadResponse.body;
    const amqp = app.get(AmqpService);
    const failedEvent = getEvent(id, false);
    await amqp.publish(
      `fiap.x.worker.events`,
      routingKeyOf(failedEvent.eventName),
      failedEvent,
    );

    await setTimeout(500);
    const res = await request(server)
      .get(`/v1/me/videos/${id}`)
      .set('Authorization', bearer);

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe(EVideoStatus.Failed);
  });
});
