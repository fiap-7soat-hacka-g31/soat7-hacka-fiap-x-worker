import { Repository } from '@fiap-x/tactical-design/core';
import { Video } from '../../domain/entities/video.aggregate';

export abstract class VideoRepository implements Repository<Video> {
  abstract create(entity: Video): Promise<void>;
  abstract update(entity: Video): Promise<void>;
  abstract findById(id: string): Promise<Video>;
  abstract findAll(): Promise<Video[]>;
  abstract newId(): string;
  abstract findByOwnerAndFilename(
    ownerId: string,
    filename: string,
  ): Promise<Video>;
}
