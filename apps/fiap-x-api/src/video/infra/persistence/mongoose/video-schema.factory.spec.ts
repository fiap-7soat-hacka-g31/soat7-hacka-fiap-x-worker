import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { Video } from '../../../domain/entities/video.aggregate';
import { CloudFile } from '../../../domain/values/cloud-file.value';
import {
  EVideoStatus,
  VideoStatus,
} from '../../../domain/values/video-status.value';
import { MongooseVideoSchemaFactory } from './video-schema.factory';
import { MongooseVideoSchema } from './video.schema';

const getFullAggregate = (): Video =>
  new Video(
    new Types.ObjectId().toHexString(),
    'video.mp4',
    new Types.ObjectId().toHexString(),
    VideoStatus.create('PROCESSED'),
    5,
    new CloudFile('Fake', 'fake', 'fake/video.mp4'),
    new CloudFile('Fake', 'fake', 'fake/video.zip'),
  );

const getFullSchema = (): MongooseVideoSchema => ({
  _id: new Types.ObjectId(),
  filename: 'video.mp4',
  ownerId: new Types.ObjectId(),
  status: EVideoStatus.Processed,
  snapshotIntervalInSeconds: 5,
  videoFile: { provider: 'fake', bucket: 'fake', path: 'fake/video.mp4' },
  zipFile: { provider: 'fake', bucket: 'fake', path: 'fake/video.zip' },
  createdAt: new Date(),
  updatedAt: new Date(),
});

describe('MongooseVideoSchemaFactory', () => {
  let app: INestApplication;
  let target: MongooseVideoSchemaFactory;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      providers: [MongooseVideoSchemaFactory],
    }).compile();

    app = moduleFixture.createNestApplication();
    target = app.get(MongooseVideoSchemaFactory);
  });

  it('should transform a Video entity into a MongooseSchema', async () => {
    const actual = getFullAggregate();
    const result = target.entityToSchema(actual);
    expect(result._id).toBeInstanceOf(Types.ObjectId);
    expect(result).not.toBeInstanceOf(Video);
  });

  it('should transform a MongooseSchema into a Video entity', async () => {
    const actual = getFullSchema();
    const result = target.schemaToEntity(actual);
    expect(result.id).not.toBeInstanceOf(Types.ObjectId);
    expect(result.id).toBe(actual._id.toHexString());
    expect(result).toBeInstanceOf(Video);
  });

  it('should transform a Video entity into a MongooseSchema', async () => {
    const actual = getFullAggregate();
    actual['_videoFile'] = null;
    actual['_zipFile'] = null;
    const result = target.entityToSchema(actual);
    expect(result._id).toBeInstanceOf(Types.ObjectId);
    expect(result).not.toBeInstanceOf(Video);
  });

  it('should transform a MongooseSchema into a Video entity', async () => {
    const actual = getFullSchema();
    actual.videoFile = null;
    actual.zipFile = null;
    const result = target.schemaToEntity(actual);
    expect(result.id).not.toBeInstanceOf(Types.ObjectId);
    expect(result.id).toBe(actual._id.toHexString());
    expect(result).toBeInstanceOf(Video);
  });
});
