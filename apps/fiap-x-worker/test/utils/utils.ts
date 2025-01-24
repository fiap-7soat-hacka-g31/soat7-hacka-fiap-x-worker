import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { INestApplication } from '@nestjs/common';
import { VideoUploaded } from 'apps/fiap-x-worker/src/snapshot/application/dtos/create-snapshots.io';
import { readFile } from 'fs/promises';
import { join } from 'path';

const getVideoPath = () =>
  join(__dirname, '..', '..', '..', '..', 'test', 'resources', 'video.mp4');

export const uploadFileWithContentType = async (
  app: INestApplication,
  input: VideoUploaded,
  contentType: string = 'video/mp4',
) => {
  const s3 = await app.resolve(S3Client);
  const content = await readFile(getVideoPath());

  const command = new PutObjectCommand({
    Bucket: input.data.bucket,
    Key: input.data.path,
    ContentType: contentType,
    Body: content,
  });

  await s3.send(command);
};
