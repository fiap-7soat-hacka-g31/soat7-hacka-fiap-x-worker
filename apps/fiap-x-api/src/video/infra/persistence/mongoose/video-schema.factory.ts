import { EntitySchemaFactory } from '@fiap-x/tactical-design/core';
import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { Video } from '../../../domain/entities/video.aggregate';
import { CloudFile } from '../../../domain/values/cloud-file.value';
import { VideoStatus } from '../../../domain/values/video-status.value';
import { MongooseCloudFileSchema, MongooseVideoSchema } from './video.schema';

@Injectable()
export class MongooseVideoSchemaFactory
  implements EntitySchemaFactory<MongooseVideoSchema, Video>
{
  entityToSchema(entity: Video): MongooseVideoSchema {
    return {
      _id: new Types.ObjectId(entity.id),
      filename: entity.filename,
      ownerId: new Types.ObjectId(entity.ownerId),
      snapshotIntervalInSeconds: entity.snapshotIntervalInSeconds,
      status: entity.status,
      videoFile: this.createCloudFileSchema(entity.videoFile),
      zipFile: this.createCloudFileSchema(entity.zipFile),
    };
  }

  schemaToEntity(entitySchema: MongooseVideoSchema): Video {
    return new Video(
      entitySchema._id.toHexString(),
      entitySchema.filename,
      entitySchema.ownerId.toHexString(),
      VideoStatus.create(entitySchema.status),
      entitySchema.snapshotIntervalInSeconds,
      this.createCloudFile(entitySchema.videoFile),
      this.createCloudFile(entitySchema.zipFile),
    );
  }

  private createCloudFileSchema(
    cloudFile?: CloudFile,
  ): MongooseCloudFileSchema {
    if (!cloudFile) {
      return null;
    }
    return {
      provider: cloudFile.provider,
      bucket: cloudFile.bucket,
      path: cloudFile.path,
    };
  }

  private createCloudFile(fileSchema: MongooseCloudFileSchema): CloudFile {
    if (!fileSchema) {
      return null;
    }
    return new CloudFile(
      fileSchema.provider,
      fileSchema.bucket,
      fileSchema.path,
    );
  }
}
