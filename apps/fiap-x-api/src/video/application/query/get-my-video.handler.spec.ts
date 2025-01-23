import { FakeMongooseModel } from '@fiap-x/test-factory/utils';
import { NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { EVideoStatus } from '../../domain/values/video-status.value';
import { MongooseVideoSchema } from '../../infra/persistence/mongoose/video.schema';
import { GetMyVideoHandler } from './get-my-video.handler';
import { GetMyVideoQuery } from './get-my-video.query';

describe('GetMyVideo', () => {
  let target: GetMyVideoHandler;
  let model: FakeMongooseModel<MongooseVideoSchema>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      providers: [
        GetMyVideoHandler,
        {
          provide: getModelToken(MongooseVideoSchema.name),
          useClass: FakeMongooseModel,
        },
      ],
    }).compile();
    target = moduleFixture.get(GetMyVideoHandler);
    model = moduleFixture.get(getModelToken(MongooseVideoSchema.name));
  });

  it('should return the video when found', async () => {
    const schema: MongooseVideoSchema = {
      _id: new Types.ObjectId(),
      ownerId: new Types.ObjectId(),
      filename: 'video.mp4',
      snapshotIntervalInSeconds: 10,
      status: EVideoStatus.Processed,
      videoFile: { provider: 'test', bucket: 'test', path: 'test' },
      zipFile: { provider: 'test', bucket: 'test', path: 'test' },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    jest.spyOn(model, 'exec').mockResolvedValue(schema);
    const result = await target.execute(
      new GetMyVideoQuery({
        id: new Types.ObjectId().toHexString(),
        ownerId: new Types.ObjectId().toHexString(),
      }),
    );
    const hexId = schema._id.toHexString();
    const actual = result.data;
    expect(result.data).toBeDefined();
    expect(actual.id).toBe(hexId);
    expect(actual.filename).toBe(schema.filename);
    expect(actual.status).toBe(schema.status);
    expect(actual.videoPath).toBe(`/videos/${hexId}?target=video`);
    expect(actual.zipPath).toBe(`/videos/${hexId}?target=zip`);
    expect(actual.snapshotIntervalInSeconds).toBe(
      schema.snapshotIntervalInSeconds,
    );
    expect(actual.updatedAt).toBeDefined();
    expect(actual.updatedAt).toBeDefined();
  });

  it('should return empty if no video is found', async () => {
    jest.spyOn(model, 'exec').mockResolvedValue(null);
    await expect(
      async () =>
        await target.execute(
          new GetMyVideoQuery({
            id: new Types.ObjectId().toHexString(),
            ownerId: new Types.ObjectId().toHexString(),
          }),
        ),
    ).rejects.toThrow(NotFoundException);
  });
});
