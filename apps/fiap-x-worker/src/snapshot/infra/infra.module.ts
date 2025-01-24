import { StorageModule } from '@fiap-x/storage';
import { Module } from '@nestjs/common';
import { ArchiveService } from '../application/abstractions/archive.service';
import { StorageService } from '../application/abstractions/storage.service';
import { VideoProcessingService } from '../application/abstractions/video-processing.service';
import { ArchiveAdapterService } from './adapters/storage/aws-s3/archiver.service';
import { AwsS3StorageAdapterService } from './adapters/storage/aws-s3/aws-s3-storage.service';
import { FFMPEGAdapterService } from './adapters/storage/aws-s3/ffmpeg.service';

@Module({
  imports: [StorageModule],
  providers: [
    {
      provide: StorageService,
      useClass: AwsS3StorageAdapterService,
    },
    {
      provide: ArchiveService,
      useClass: ArchiveAdapterService,
    },
    {
      provide: VideoProcessingService,
      useClass: FFMPEGAdapterService,
    },
  ],
  exports: [StorageService, ArchiveService, VideoProcessingService],
})
export class InfraModule {}
