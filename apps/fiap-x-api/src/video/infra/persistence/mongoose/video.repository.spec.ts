import {
  AggregateMergeContext,
  TransactionManager,
} from '@fiap-x/tactical-design/core';
import { FakeMongooseModel } from '@fiap-x/test-factory/utils';
import { INestApplication } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { VideoRepository } from '../../../application/abstractions/video.repository';
import { MongooseVideoSchemaFactory } from './video-schema.factory';
import { MongooseVideoRepository } from './video.repository';
import { MongooseVideoSchema } from './video.schema';

describe('MongooseVideoRepository', () => {
  let app: INestApplication;
  let target: VideoRepository;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: TransactionManager,
          useValue: Object.create(TransactionManager.prototype),
        },
        {
          provide: getModelToken(MongooseVideoSchema.name),
          useClass: FakeMongooseModel,
        },
        {
          provide: MongooseVideoSchemaFactory,
          useValue: Object.create(MongooseVideoSchema.prototype),
        },
        {
          provide: AggregateMergeContext,
          useValue: Object.create(AggregateMergeContext.prototype),
        },
        {
          provide: VideoRepository,
          useClass: MongooseVideoRepository,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    target = app.get(VideoRepository);
  });

  it('should instantiate correctly', async () => {
    expect(target).toBeInstanceOf(MongooseVideoRepository);
  });
});
