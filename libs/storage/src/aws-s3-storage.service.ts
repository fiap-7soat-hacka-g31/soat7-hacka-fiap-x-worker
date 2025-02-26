import {
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable } from '@nestjs/common';
import { createWriteStream } from 'fs';
import { Readable } from 'stream';
import {
  FileDownloadInput,
  FileInfoInput,
  FileInfoOutput,
  FileUploadInput,
  FileUploadOutput,
  SignedUrlOutput,
} from './dto';

@Injectable()
export class AwsS3StorageService {
  private readonly provider = 'AWS::S3';

  constructor(private readonly s3Client: S3Client) {}

  async getInfo({ key, bucket }: FileInfoInput): Promise<FileInfoOutput> {
    const command = new HeadObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    const result = await this.s3Client.send(command);

    return {
      contentType: result.ContentType,
      contentLength: result.ContentLength,
    };
  }

  async createSignedUrlForDownload(
    bucket: string,
    key: string,
  ): Promise<SignedUrlOutput> {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    const signedUrl = await getSignedUrl(this.s3Client, command);
    return {
      provider: this.provider,
      bucket,
      key,
      signedUrl,
    };
  }

  async createSignedUrlForUpload(
    bucket: string,
    key: string,
  ): Promise<SignedUrlOutput> {
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    const signedUrl = await getSignedUrl(this.s3Client, command, {
      expiresIn: 3600,
    });

    return {
      provider: this.provider,
      bucket,
      key,
      signedUrl,
    };
  }

  async downloadFile({
    bucket,
    key,
    downloadToPath,
  }: FileDownloadInput): Promise<{ contentType: string }> {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
      ChecksumMode: false as any,
    });
    const { ContentType, Body: data } = await this.s3Client.send(command);

    const writeStream = createWriteStream(downloadToPath);
    this.assertIsReadable(data);

    return new Promise((resolve, reject) => {
      data
        .pipe(writeStream)
        .on('error', (...args) => reject(...args))
        .on('finish', () => resolve({ contentType: ContentType }));
    });
  }

  private assertIsReadable(value: unknown): asserts value is Readable {
    if (value instanceof Readable) {
      return;
    }
    throw new Error('Unprocessable s3 download file is not a readable stream');
  }

  async uploadFile({
    bucket,
    key: path,
    content,
  }: FileUploadInput): Promise<FileUploadOutput> {
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: path,
      Body: content,
    });
    await this.s3Client.send(command);
    return {
      provider: this.provider,
      bucket,
      key: path,
    };
  }
}
