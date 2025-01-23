import { AwsS3StorageService } from '@fiap-x/storage';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CreateSignedUrlForUploadResult,
  StorageService,
} from '../../../../application/abstractions/storage.service';

@Injectable()
export class AwsS3VideoStorageService implements StorageService {
  constructor(
    private readonly client: AwsS3StorageService,
    private readonly config: ConfigService,
  ) {}

  async createSignedUrlForUpload(
    path: string,
  ): Promise<CreateSignedUrlForUploadResult> {
    const bucket = this.config.get('AWS_S3_BUCKET_NAME');
    const result = await this.client.createSignedUrlForUpload(bucket, path);
    return {
      provider: result.provider,
      bucket: result.bucket,
      path: result.key,
      signedUrl: result.signedUrl,
    };
  }
}
