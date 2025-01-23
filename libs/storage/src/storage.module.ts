import { S3Client } from '@aws-sdk/client-s3';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AwsS3ConfigFactory } from './aws-s3-config.factory';
import { AwsS3StorageService } from './aws-s3-storage.service';

@Module({
  providers: [
    AwsS3StorageService,
    {
      provide: S3Client,
      inject: [ConfigService],
      useFactory: AwsS3ConfigFactory.createS3Client.bind(AwsS3ConfigFactory),
    },
  ],
  exports: [AwsS3StorageService],
})
export class StorageModule {}
