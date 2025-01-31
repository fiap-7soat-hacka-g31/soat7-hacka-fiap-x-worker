import { AggregatePublisherContext } from '@fiap-x/tactical-design/core';
import { ConfigService } from '@nestjs/config';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SnapshotsProcessed } from '../../domain/events/snapshots-processed.event';
import { ArchiveService } from '../abstractions/archive.service';
import { CloudFile, StorageService } from '../abstractions/storage.service';
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
    const { event, currentAttempt } = command;
    const { snapshotIntervalInSeconds, ...cloudFile } = event.data;
    const error = await this.validateFile(cloudFile, currentAttempt);
    if (error) {
      return await this.rejectProcessing(event.aggregateId, error);
    }
    const baseProcessingPath = this.getProcessingPath();
    const directoryPathForProcessing = `${baseProcessingPath}/${event.aggregateId}`;
    const pathToVideoFile = `${directoryPathForProcessing}/video`;
    const pathToSnapshotsDirectory = `${directoryPathForProcessing}/snapshots`;
    const pathToArchiveFile = `${cloudFile.path}.zip`;

    await this.storage.createDirectory(directoryPathForProcessing);
    await this.storage.createDirectory(pathToSnapshotsDirectory);
    await this.storage.downloadFileToPath(cloudFile, pathToVideoFile);

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
    await this.completeProcessing(event.aggregateId, {
      ...cloudFile,
      path: pathToArchiveFile,
    });
    await this.storage.removeDirectory(directoryPathForProcessing);
  }

  private async completeProcessing(aggregateId: string, file: CloudFile) {
    await this.eventPublisher.commit(
      SnapshotsProcessed.createSuccess(
        aggregateId,
        file.provider,
        file.bucket,
        file.path,
      ),
    );
  }

  private async rejectProcessing(aggregateId: string, error: string) {
    return await this.eventPublisher.commit(
      SnapshotsProcessed.createFailed(aggregateId, error),
    );
  }

  private async validateFile(file: CloudFile, currentAttempt: number) {
    const MAXIMUM_ATTEMPTS_TO_TRY = 20;
    if (currentAttempt >= MAXIMUM_ATTEMPTS_TO_TRY) {
      return 'Video file could not be processed';
    }

    const fileInfo = await this.storage.getFileInfo(file);
    if (!fileInfo.contentType.includes('video/')) {
      return 'Invalid file format';
    }
    const fiveMegabytes = 5 * 1024 * 1024;
    const maximumProcessingLength = Number(
      this.config.get(
        'MAXIMUM_PROCESSABLE_SIZE_BYTES',
        fiveMegabytes.toString(),
      ),
    );
    if (fileInfo.contentLength > maximumProcessingLength) {
      return 'File is too large to handle';
    }
  }

  private getProcessingPath() {
    return this.config.get('BASE_PATH_FILE_PROCESSING', './processing');
  }
}
