import { AggregatePublisherContext } from '@fiap-x/tactical-design/core';
import { BadRequestException, Logger } from '@nestjs/common';
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
  private readonly logger = new Logger(this.constructor.name);
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
    this.logger.warn(`ProcessingPath: ${processingPath}`);
    const { event, currentAttempt } = command;
    this.logger.warn(`CurrentAttempt: ${currentAttempt}`);
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
    this.logger.warn(
      `created directory for processing: ${directoryPathForProcessing}`,
    );
    const contentType = await this.storage.downloadFileToPath(
      cloudFile,
      pathToVideoFile,
    );
    this.logger.warn(`Downloaded file: ${cloudFile.path} ${contentType}`);
    try {
      if (!contentType.includes('video/')) {
        throw new BadRequestException('File is not a video file');
      }
      await this.storage.createDirectory(pathToSnapshotsDirectory);
      this.logger.warn(
        `Created Directory for Snapshots: ${pathToSnapshotsDirectory}`,
      );
      await this.videoProcessor.takeSnapshots({
        pathToVideo: pathToVideoFile,
        pathToSnapshotsDirectory,
        snapshotIntervalInSeconds,
      });
      this.logger.warn(`snapshots taken`);
      const archiveFilePath = await this.archiver.createArchive({
        pathToArchive: pathToSnapshotsDirectory,
        outputFileName: 'archive',
      });
      this.logger.warn(`archive created ${archiveFilePath}`);

      await this.storage.uploadFileFromPath(archiveFilePath, pathToArchiveFile);
      this.logger.warn('`uploaded zip file to cloud');
      await this.eventPublisher.commit(
        SnapshotsProcessed.createSuccess(
          event.aggregateId,
          cloudFile.provider,
          cloudFile.bucket,
          pathToArchiveFile,
        ),
      );
    } catch (err) {
      this.logger.warn(`Failed: ${err.message}`);
      await this.eventPublisher.commit(
        SnapshotsProcessed.createFailed(event.aggregateId, err.message),
      );
    } finally {
      await this.storage.removeDirectory(directoryPathForProcessing);
    }
  }
}
