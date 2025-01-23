import { TransactionManager } from '@fiap-x/tactical-design/core';
import {
  FakeRepository,
  FakeTransactionManager,
} from '@fiap-x/test-factory/utils';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { Video } from '../../domain/entities/video.aggregate';
import { CloudFile } from '../../domain/values/cloud-file.value';
import {
  EVideoStatus,
  VideoStatus,
} from '../../domain/values/video-status.value';
import { VideoRepository } from '../abstractions/video.repository';
import { ProcessSnapshotsResultCommand } from './process-snapshots-result.command';
import { ProcessSnapshotsResultHandler } from './process-snapshots-result.handler';

describe('ProcessSnapshotsResultHandler', () => {
  let target: ProcessSnapshotsResultHandler;
  let repository: VideoRepository;

  beforeAll(() => {
    jest.useFakeTimers();
  });

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      providers: [
        ProcessSnapshotsResultHandler,
        {
          provide: TransactionManager,
          useClass: FakeTransactionManager,
        },
        {
          provide: VideoRepository,
          useClass: FakeRepository,
        },
      ],
    }).compile();

    target = moduleFixture.get(ProcessSnapshotsResultHandler);
    repository = moduleFixture.get(VideoRepository);
  });

  const getAggregate = () =>
    new Video(
      new Types.ObjectId().toHexString(),
      'video.mp4',
      new Types.ObjectId().toHexString(),
      VideoStatus.new(),
      5,
      new CloudFile('AWS::S3', 'bucket', 'path/video.mp4'),
    );

  const getZipFileForAggregate = (aggregate: Video) => ({
    provider: aggregate.videoFile.provider,
    bucket: aggregate.videoFile.bucket,
    path: aggregate.videoFile.path.replace('.mp4', '.zip'),
  });

  const getCommand = (aggregate: Video) =>
    new ProcessSnapshotsResultCommand({
      data: {
        id: aggregate.id,
        ...getZipFileForAggregate(aggregate),
        status: 'SUCCESS',
      },
    } as any);

  it('should append zipfile to aggregate', async () => {
    const aggregate = getAggregate();
    const zipFile = getZipFileForAggregate(aggregate);
    const command = getCommand(aggregate);
    jest.spyOn(repository, 'findById').mockResolvedValue(aggregate);
    jest.spyOn(repository, 'update').mockResolvedValue();
    await target.execute(command);
    expect(aggregate.zipFile.provider).toBe(zipFile.provider);
    expect(aggregate.zipFile.bucket).toBe(zipFile.bucket);
    expect(aggregate.zipFile.path).toBe(zipFile.path);
    expect(aggregate.status).toBe(EVideoStatus.Processed);
    expect(repository.findById).toHaveBeenCalled();
    expect(repository.update).toHaveBeenCalled();
  });

  it('should throw not found if aggregate does not exist', async () => {
    const aggregate = getAggregate();
    const command = getCommand(aggregate);
    jest.spyOn(repository, 'findById').mockResolvedValue(null);
    jest.spyOn(repository, 'update').mockResolvedValue();
    await expect(async () => await target.execute(command)).rejects.toThrow(
      NotFoundException,
    );
    expect(aggregate.zipFile).toBeNull();
    expect(repository.findById).toHaveBeenCalled();
    expect(repository.update).not.toHaveBeenCalled();
  });

  it('should add failed reason', async () => {
    const aggregate = getAggregate();
    const command = getCommand(aggregate);
    command.event.data.status = 'FAILED';
    command.event.data.failReason = 'Too bad!';
    jest.spyOn(repository, 'findById').mockResolvedValue(aggregate);
    jest.spyOn(repository, 'update').mockResolvedValue();
    await target.execute(command);
    expect(aggregate.zipFile).toBeNull();
    expect(aggregate.status).toBe(EVideoStatus.Failed);
    expect(repository.findById).toHaveBeenCalled();
    expect(repository.update).toHaveBeenCalled();
  });
});
