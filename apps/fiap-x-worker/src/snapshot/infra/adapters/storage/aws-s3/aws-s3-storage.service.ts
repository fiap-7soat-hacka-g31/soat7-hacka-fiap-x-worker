import { AwsS3StorageService } from '@fiap-x/storage';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { mkdir, readFile, rm } from 'fs/promises';
import {
  CloudFile,
  StorageService,
} from '../../../../application/abstractions/storage.service';

@Injectable()
export class AwsS3StorageAdapterService implements StorageService {
  constructor(
    private readonly client: AwsS3StorageService,
    private readonly config: ConfigService,
  ) {}

  async createDirectory(path: string): Promise<void> {
    await mkdir(path, { recursive: true });
  }

  async removeDirectory(path: string): Promise<void> {
    await rm(path, { force: true, recursive: true });
  }

  async uploadFileFromPath(path: string, cloudPath: string): Promise<void> {
    const bucket = this.config.get('AWS_S3_BUCKET_NAME');
    const content = await readFile(path);
    await this.client.uploadFile({
      bucket,
      key: cloudPath,
      content,
    });
  }

  async downloadFileToPath(
    file: CloudFile,
    pathToDownload: string,
  ): Promise<string> {
    const result = await this.client.downloadFile({
      bucket: file.bucket,
      key: file.path,
      downloadToPath: pathToDownload,
    });

    return result.contentType;
  }
}
