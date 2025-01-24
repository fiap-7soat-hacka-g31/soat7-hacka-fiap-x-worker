import { IntegrationEvent } from '@fiap-x/tactical-design/core';
import { IsInt, IsString } from 'class-validator';

export class VideoUploadedInput {
  @IsString()
  provider: string;

  @IsString()
  bucket: string;

  @IsString()
  path: string;

  @IsInt()
  snapshotIntervalInSeconds: number;
}

export class VideoUploaded extends IntegrationEvent<VideoUploadedInput> {}
