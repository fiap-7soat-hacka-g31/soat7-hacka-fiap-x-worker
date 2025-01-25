import {
  AggregatePublisherContext,
  TransactionManager,
} from '@fiap-x/tactical-design/core';
import { FakeTransactionManager } from '@fiap-x/test-factory/utils';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import { ArchiveAdapterService } from '../../infra/adapters/storage/aws-s3/archiver.service';
import { AwsS3StorageAdapterService } from '../../infra/adapters/storage/aws-s3/aws-s3-storage.service';
import { FFMPEGAdapterService } from '../../infra/adapters/storage/aws-s3/ffmpeg.service';
import { ArchiveService } from '../abstractions/archive.service';
import { StorageService } from '../abstractions/storage.service';
import { VideoProcessingService } from '../abstractions/video-processing.service';
import { VideoUploaded, VideoUploadedInput } from '../dtos/create-snapshots.io';
import { CreateSnapshotsCommand } from './create-snapshots.command';
import { CreateSnapshotsHandler } from './create-snapshots.handler';

describe('CreateSnapshotsHandler', () => {
  let app: INestApplication;
  let target: CreateSnapshotsHandler;
  let storage: StorageService;
  let archive: ArchiveService;
  let videoProcessor: VideoProcessingService;
  let eventPublisher: AggregatePublisherContext;

  beforeAll(() => {
    jest.useFakeTimers();
  });

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      providers: [
        CreateSnapshotsHandler,
        {
          provide: TransactionManager,
          useClass: FakeTransactionManager,
        },
        {
          provide: StorageService,
          useValue: Object.create(AwsS3StorageAdapterService.prototype),
        },
        {
          provide: ArchiveService,
          useValue: Object.create(ArchiveAdapterService.prototype),
        },
        {
          provide: VideoProcessingService,
          useValue: Object.create(FFMPEGAdapterService.prototype),
        },
        {
          provide: AggregatePublisherContext,
          useValue: Object.create(AggregatePublisherContext.prototype),
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    target = app.get(CreateSnapshotsHandler);
    storage = app.get(StorageService);
    archive = app.get(ArchiveService);
    videoProcessor = app.get(VideoProcessingService);
    eventPublisher = app.get(AggregatePublisherContext);
    eventPublisher.commit = jest.fn();
  });

  const createCommand = () => {
    const input = new VideoUploadedInput();
    input.provider = 'fake';
    input.bucket = 'dummy';
    input.path = 'userid/objectid';
    input.snapshotIntervalInSeconds = 2;
    const command = new CreateSnapshotsCommand(
      new VideoUploaded(
        randomUUID(),
        randomUUID(),
        VideoUploaded.name,
        new Date(),
        0,
        input,
      ),
    );
    command.currentAttempt = 1;
    return command;
  };

  it('should throw if download throws', async () => {
    jest.spyOn(storage, 'createDirectory').mockResolvedValue();
    jest
      .spyOn(storage, 'downloadFileToPath')
      .mockRejectedValue(new Error('too bad'));
    const command = createCommand();
    await expect(async () => await target.execute(command)).rejects.toThrow();
  });

  it('should reject processing when max attempt is reached', async () => {
    jest.spyOn(eventPublisher, 'commit').mockResolvedValue();
    const command = createCommand();
    command.currentAttempt = 99999;
    await target.execute(command);
    expect(eventPublisher.commit).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          id: command.event.aggregateId,
          status: 'FAILED',
          failReason:
            'Video file could not be processed before reaching maximum attempts',
        }),
      }),
    );
  });

  it('should reject processing if file is not a video file', async () => {
    jest.spyOn(storage, 'createDirectory').mockResolvedValue();
    jest
      .spyOn(storage, 'downloadFileToPath')
      .mockResolvedValue('application/pdf');
    jest.spyOn(eventPublisher, 'commit');
    const command = createCommand();
    await target.execute(command);
    expect(eventPublisher.commit).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          id: command.event.aggregateId,
          status: 'FAILED',
          failReason: 'File is not a video file',
        }),
      }),
    );
  });

  it('should process video and emit success event', async () => {
    jest.spyOn(storage, 'createDirectory').mockResolvedValue();
    jest.spyOn(storage, 'downloadFileToPath').mockResolvedValue('video/mp4');
    jest.spyOn(storage, 'uploadFileFromPath').mockResolvedValue();
    jest.spyOn(archive, 'createArchive').mockResolvedValue('path/to/file.zip');
    jest.spyOn(videoProcessor, 'takeSnapshots').mockResolvedValue();
    jest.spyOn(eventPublisher, 'commit');
    const command = createCommand();
    await target.execute(command);
    expect(eventPublisher.commit).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          id: command.event.aggregateId,
          status: 'SUCCESS',
        }),
      }),
    );
  });
});
