import { StorageModule } from '@fiap-x/storage';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StorageService } from '../application/abstractions/storage.service';
import { VideoRepository } from '../application/abstractions/video.repository';
import { AwsS3VideoStorageService } from './adapters/storage/aws-s3/aws-s3-storage.service';
import { MongooseVideoSchemaFactory } from './persistence/mongoose/video-schema.factory';
import { MongooseVideoRepository } from './persistence/mongoose/video.repository';
import {
  MongooseVideoSchema,
  MongooseVideoSchemaModel,
} from './persistence/mongoose/video.schema';

const MongooseSchemaModule = MongooseModule.forFeature([
  {
    name: MongooseVideoSchema.name,
    schema: MongooseVideoSchemaModel,
  },
]);

MongooseSchemaModule.global = true;

@Module({
  imports: [StorageModule, MongooseSchemaModule],
  providers: [
    MongooseVideoSchemaFactory,
    {
      provide: VideoRepository,
      useClass: MongooseVideoRepository,
    },
    {
      provide: StorageService,
      useClass: AwsS3VideoStorageService,
    },
  ],
  exports: [VideoRepository, StorageService],
})
export class InfraModule {}
