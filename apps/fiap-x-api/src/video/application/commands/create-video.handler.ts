import { Transactional } from '@fiap-x/tactical-design/core';
import { ConflictException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Video } from '../../domain/entities/video.aggregate';
import { VideoStatus } from '../../domain/values/video-status.value';
import { StorageService } from '../abstractions/storage.service';
import { VideoRepository } from '../abstractions/video.repository';
import { CreateVideoCommand, CreateVideoResult } from './create-video.command';

@CommandHandler(CreateVideoCommand)
export class CreateVideoHandler
  implements ICommandHandler<CreateVideoCommand, CreateVideoResult>
{
  constructor(
    private readonly repository: VideoRepository,
    private readonly storage: StorageService,
  ) {}

  @Transactional()
  async execute(command: CreateVideoCommand): Promise<CreateVideoResult> {
    const { data } = command;
    const exists = await this.repository.findByOwnerAndFilename(
      data.ownerId,
      data.filename,
    );
    if (exists) {
      throw new ConflictException('Video already exists');
    }
    const video = new Video(
      this.repository.newId(),
      data.filename,
      data.ownerId,
      VideoStatus.new(),
      data.snapshotIntervalInSeconds,
    );
    const { provider, bucket, path, signedUrl } =
      await this.storage.createSignedUrlForUpload(
        `${data.ownerId}/${video.id}`,
      );
    video.create(provider, bucket, path);
    await this.repository.create(video);
    await video.commit();
    return new CreateVideoResult({
      id: video.id,
      signedUrlForUpload: signedUrl,
    });
  }
}
