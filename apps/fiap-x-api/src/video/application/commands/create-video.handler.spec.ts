import { TransactionManager } from '@fiap-x/tactical-design/core';
import {
  FakeRepository,
  FakeTransactionManager,
} from '@fiap-x/test-factory/utils';
import { ConflictException, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { Video } from '../../domain/entities/video.aggregate';
import { CloudFile } from '../../domain/values/cloud-file.value';
import { VideoStatus } from '../../domain/values/video-status.value';
import { AwsS3VideoStorageService } from '../../infra/adapters/storage/aws-s3/aws-s3-storage.service';
import { StorageService } from '../abstractions/storage.service';
import { VideoRepository } from '../abstractions/video.repository';
import { CreateVideoCommand } from './create-video.command';
import { CreateVideoHandler } from './create-video.handler';

describe('CreateVideoHandler', () => {
  let app: INestApplication;
  let target: CreateVideoHandler;
  let repository: VideoRepository;
  let storage: StorageService;

  beforeAll(() => {
    jest.useFakeTimers();
  });

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      providers: [
        CreateVideoHandler,
        {
          provide: TransactionManager,
          useClass: FakeTransactionManager,
        },
        {
          provide: VideoRepository,
          useClass: FakeRepository,
        },
        {
          provide: StorageService,
          useValue: Object.create(AwsS3VideoStorageService.prototype),
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    target = app.get(CreateVideoHandler);
    repository = app.get(VideoRepository);
    storage = app.get(StorageService);
    repository.findByOwnerAndFilename = jest.fn();
    jest
      .spyOn(repository, 'newId')
      .mockReturnValue(new Types.ObjectId().toHexString());
  });

  const getAggregate = () =>
    new Video(
      new Types.ObjectId().toHexString(),
      'video.mp4',
      new Types.ObjectId().toHexString(),
      VideoStatus.new(),
      5,
      new CloudFile('AWS::S3', 'bucket', 'path/video.mp4'),
      new CloudFile('AWS::S3', 'bucket', 'path/video.zip'),
    );

  const getCommand = (aggregate: Video) =>
    new CreateVideoCommand({
      filename: aggregate.filename,
      ownerId: aggregate.ownerId,
    });

  it('should create the new video and return a signed url for it', async () => {
    const aggregate = getAggregate();
    const command = getCommand(aggregate);
    jest.spyOn(storage, 'createSignedUrlForUpload').mockResolvedValue({
      provider: 'AWS::S3',
      bucket: 'test',
      path: `${command.data.ownerId}/${command.data.filename}`,
      signedUrl: 'test',
    });
    jest.spyOn(repository, 'findByOwnerAndFilename').mockResolvedValue(null);
    jest.spyOn(repository, 'create').mockResolvedValue();
    const result = await target.execute(command);
    expect(repository.findByOwnerAndFilename).toHaveBeenCalled();
    expect(storage.createSignedUrlForUpload).toHaveBeenCalled();
    expect(repository.create).toHaveBeenCalled();
    expect(result.data.signedUrlForUpload).toBeDefined();
  });

  it('should throw conflict if video already existscreate the new video', async () => {
    const aggregate = getAggregate();
    const command = getCommand(aggregate);
    jest.spyOn(storage, 'createSignedUrlForUpload').mockResolvedValue({
      provider: 'AWS::S3',
      bucket: 'test',
      path: `${command.data.ownerId}/${command.data.filename}`,
      signedUrl: 'test',
    });
    jest
      .spyOn(repository, 'findByOwnerAndFilename')
      .mockResolvedValue(aggregate);
    jest.spyOn(repository, 'create').mockResolvedValue();
    await expect(async () => await target.execute(command)).rejects.toThrow(
      ConflictException,
    );
    expect(repository.findByOwnerAndFilename).toHaveBeenCalled();
    expect(storage.createSignedUrlForUpload).not.toHaveBeenCalled();
    expect(repository.create).not.toHaveBeenCalled();
  });
});
