import { AmqpService } from '@fiap-x/amqp';
import { AmqpParams } from '@fiap-x/amqp/utils/amqp-params.util';
import { routingKeyOf } from '@fiap-x/tactical-design/amqp';
import { AggregatePublisherContext } from '@fiap-x/tactical-design/core';
import { destroyTestApp, environment } from '@fiap-x/test-factory/utils';
import { INestApplication } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { App } from 'supertest/types';
import { setTimeout } from 'timers/promises';
import {
  VideoUploaded,
  VideoUploadedInput,
} from '../src/snapshot/application/dtos/create-snapshots.io';
import { createTestApp } from './create-app';
import { uploadFileWithContentType } from './utils/utils';

describe('CreateSnapshots', () => {
  let app: INestApplication;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let server: App;

  beforeAll(async () => {
    app = await createTestApp();
    server /* NOSONAR */ = app.getHttpServer();
  });

  afterAll(async () => {
    await destroyTestApp(app);
  });

  const createInput = () => {
    const userId = randomUUID();
    const objectId = randomUUID();
    const input = new VideoUploadedInput();
    input.provider = 'test';
    input.bucket = environment.AWS_S3_BUCKET_NAME;
    input.path = `${userId}/${objectId}`;
    input.snapshotIntervalInSeconds = 1;
    return new VideoUploaded(
      randomUUID(),
      objectId,
      VideoUploaded.name,
      new Date(),
      0,
      input,
    );
  };

  it('should process video and emit success event', async () => {
    const amqp = app.get(AmqpService);
    const eventPublisher = app.get(AggregatePublisherContext);
    jest.spyOn(eventPublisher, 'commit');
    const input = createInput();
    await uploadFileWithContentType(app, input);
    await amqp.publish(
      `fiap.x.api.events`,
      routingKeyOf(input.eventName),
      input,
    );
    await setTimeout(2500);
    expect(eventPublisher.commit).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          id: input.aggregateId,
          status: 'SUCCESS',
        }),
      }),
    );
  });

  it('should reject video and emit failed event if file is not a videofile', async () => {
    const amqp = app.get(AmqpService);
    const eventPublisher = app.get(AggregatePublisherContext);
    jest.spyOn(eventPublisher, 'commit');
    const input = createInput();
    await uploadFileWithContentType(app, input, 'application/pdf');
    await amqp.publish(
      `fiap.x.api.events`,
      routingKeyOf(input.eventName),
      input,
    );
    await setTimeout(2500);
    expect(eventPublisher.commit).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          id: input.aggregateId,
          status: 'FAILED',
          failReason: 'Invalid file format',
        }),
      }),
    );
  });

  it('should reject processing when maximum attempts reached', async () => {
    const amqp = app.get(AmqpService);
    const eventPublisher = app.get(AggregatePublisherContext);
    jest.spyOn(eventPublisher, 'commit');
    const input = createInput();
    await uploadFileWithContentType(app, input, 'video/mp4');
    await amqp.publish(
      `fiap.x.api.events`,
      routingKeyOf(input.eventName),
      input,
      { headers: { [AmqpParams.AttemptCountHeader]: 99999 } } as any,
    );
    await setTimeout(2500);
    expect(eventPublisher.commit).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          id: input.aggregateId,
          status: 'FAILED',
          failReason: 'Video file could not be processed',
        }),
      }),
    );
  });
});
