import { AggregatePublisherContext } from '@fiap-x/tactical-design/core';
import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SnapshotsProcessed } from '../../domain/events/snapshots-processed.event';
import { ArchiveService } from '../abstractions/archive.service';
import { StorageService } from '../abstractions/storage.service';
import { VideoProcessingService } from '../abstractions/video-processing.service';
import { CreateSnapshotsCommand } from './create-snapshots.command';

@CommandHandler(CreateSnapshotsCommand)
export class CreateSnapshotsHandler
  implements ICommandHandler<CreateSnapshotsCommand, void>
{
  constructor(
    private readonly archiver: ArchiveService,
    private readonly videoProcessor: VideoProcessingService,
    private readonly storage: StorageService,
    private readonly eventPublisher: AggregatePublisherContext,
    private readonly config: ConfigService,
  ) {}

  async execute(command: CreateSnapshotsCommand): Promise<void> {
    const processingPath = this.config.get(
      'BASE_PATH_FILE_PROCESSING',
      './processing',
    );
    const { event, currentAttempt } = command;
    if (currentAttempt >= 20) {
      return await this.eventPublisher.commit(
        SnapshotsProcessed.createFailed(
          event.aggregateId,
          'Video file could not be processed before reaching maximum attempts',
        ),
      );
    }

    const { snapshotIntervalInSeconds, ...cloudFile } = event.data;
    const directoryPathForProcessing = `${processingPath}/${event.aggregateId}`;
    const pathToVideoFile = `${directoryPathForProcessing}/video`;
    const pathToSnapshotsDirectory = `${directoryPathForProcessing}/snapshots`;
    const pathToArchiveFile = `${cloudFile.path}.zip`;
    await this.storage.createDirectory(directoryPathForProcessing);
    const contentType = await this.storage.downloadFileToPath(
      cloudFile,
      pathToVideoFile,
    );
    try {
      if (!contentType.includes('video/')) {
        throw new BadRequestException('File is not a video file');
      }
      await this.storage.createDirectory(pathToSnapshotsDirectory);
      await this.videoProcessor.takeSnapshots({
        pathToVideo: pathToVideoFile,
        pathToSnapshotsDirectory,
        snapshotIntervalInSeconds,
      });
      const archiveFilePath = await this.archiver.createArchive({
        pathToArchive: pathToSnapshotsDirectory,
        outputFileName: 'archive',
      });

      await this.storage.uploadFileFromPath(archiveFilePath, pathToArchiveFile);
      await this.eventPublisher.commit(
        SnapshotsProcessed.createSuccess(
          event.aggregateId,
          cloudFile.provider,
          cloudFile.bucket,
          pathToArchiveFile,
        ),
      );
    } catch (err) {
      await this.eventPublisher.commit(
        SnapshotsProcessed.createFailed(event.aggregateId, err.message),
      );
    } finally {
      await this.storage.removeDirectory(directoryPathForProcessing);
    }
  }
}
